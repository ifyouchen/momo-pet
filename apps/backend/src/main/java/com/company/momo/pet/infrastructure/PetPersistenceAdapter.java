package com.company.momo.pet.infrastructure;

import com.company.momo.pet.domain.Pet;
import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.PetRepository;
import com.company.momo.pet.domain.PetStatus;
import com.company.momo.pet.domain.PetStatusCount;
import com.company.momo.pet.domain.Species;
import com.company.momo.platform.domain.PageQuery;
import com.company.momo.platform.domain.PageResult;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * pet 基础档案 Infrastructure 仓储实现，负责 Domain 与 JPA 对象转换。
 *
 * <p>直接使用 {@link EntityManager} + JPQL / Criteria API，不依赖 Spring Data
 * 派生方法，保持仓储实现与 Spring Data 解耦。</p>
 */
@Repository
class PetPersistenceAdapter implements PetRepository {

    private static final String FIELD_SPECIES = "species";
    private static final String FIELD_STATUS = "status";
    private static final String FIELD_CREATED_AT = "createdAt";

    private final EntityManager entityManager;

    PetPersistenceAdapter(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    /**
     * 按宠物 ID 查询处于 ACTIVE 状态的宠物。
     *
     * <p>仅匹配状态为 {@link PetStatus#ACTIVE} 的记录，INACTIVE 状态的宠物不会返回。</p>
     *
     * @param petId 宠物 ID
     * @return 宠物聚合根；不存在或状态非 ACTIVE 时返回 {@link Optional#empty()}
     */
    @Override
    public Optional<Pet> findActivePetById(PetId petId) {
        return entityManager
            .createQuery(
                "select p from PetJpaEntity p where p.id = :id and p.status = :status",
                PetJpaEntity.class
            )
            .setParameter("id", petId.value())
            .setParameter("status", PetStatus.ACTIVE)
            .getResultStream()
            .findFirst()
            .map(PetJpaMapper::toDomain);
    }

    /**
     * 保存或更新宠物聚合根。
     *
     * <p>基于 {@code EntityManager.merge}，对已存在 ID 的宠物执行更新，对新 ID 执行插入。</p>
     *
     * @param pet 宠物聚合根
     */
    @Override
    public void save(Pet pet) {
        entityManager.merge(PetJpaMapper.toEntity(pet));
    }

    /**
     * 按物种和状态分页查询宠物，按创建时间倒序。
     *
     * <p>传入 {@code null} 的过滤条件会被忽略；total 走独立的 count 查询，保证分页结果准确。</p>
     *
     * @param species 物种过滤，可空
     * @param status 状态过滤，可空
     * @param pageQuery 分页参数
     * @return 当前页宠物列表与总数
     */
    @Override
    public PageResult<Pet> findPets(Species species, PetStatus status, PageQuery pageQuery) {
        List<PetJpaEntity> entities = findPetEntities(species, status, pageQuery);
        long total = countPetEntities(species, status);
        List<Pet> items = entities.stream().map(PetJpaMapper::toDomain).toList();
        return new PageResult<>(items, total, pageQuery.page(), pageQuery.size());
    }

    /**
     * 按状态统计宠物数量。
     *
     * @param status 宠物状态
     * @return 匹配该状态的宠物总数
     */
    @Override
    public long countByStatus(PetStatus status) {
        return entityManager
            .createQuery(
                "select count(p) from PetJpaEntity p where p.status = :status",
                Long.class
            )
            .setParameter("status", status)
            .getSingleResult();
    }

    /**
     * 统计所有宠物数量，不区分状态或物种。
     *
     * @return 全部宠物总数
     */
    @Override
    public long count() {
        return entityManager
            .createQuery("select count(p) from PetJpaEntity p", Long.class)
            .getSingleResult();
    }

    /**
     * 按状态聚合统计宠物数量，一次返回所有状态的计数。
     *
     * <p>JPQL constructor expression 直接映射到 {@link PetStatusCount}。</p>
     *
     * @return 每个非空状态对应的 {@link PetStatusCount} 列表
     */
    @Override
    public List<PetStatusCount> countPetsGroupedByStatus() {
        return entityManager
            .createQuery(
                "select new com.company.momo.pet.domain.PetStatusCount(p.status, count(p)) "
                    + "from PetJpaEntity p group by p.status",
                PetStatusCount.class
            )
            .getResultList();
    }

    /**
     * 分页查询宠物实体。
     */
    private List<PetJpaEntity> findPetEntities(Species species, PetStatus status, PageQuery pageQuery) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<PetJpaEntity> criteriaQuery = criteriaBuilder.createQuery(PetJpaEntity.class);
        Root<PetJpaEntity> root = criteriaQuery.from(PetJpaEntity.class);
        List<Predicate> predicates = buildPetPredicates(criteriaBuilder, root, species, status);
        Order order = criteriaBuilder.desc(root.get(FIELD_CREATED_AT));
        criteriaQuery.select(root)
            .where(predicates.toArray(new Predicate[0]))
            .orderBy(order);
        TypedQuery<PetJpaEntity> query = entityManager.createQuery(criteriaQuery);
        query.setFirstResult(resolveOffset(pageQuery));
        query.setMaxResults(pageQuery.size());
        return query.getResultList();
    }

    /**
     * 统计满足过滤条件的宠物数量。
     */
    private long countPetEntities(Species species, PetStatus status) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> criteriaQuery = criteriaBuilder.createQuery(Long.class);
        Root<PetJpaEntity> root = criteriaQuery.from(PetJpaEntity.class);
        List<Predicate> predicates = buildPetPredicates(criteriaBuilder, root, species, status);
        criteriaQuery.select(criteriaBuilder.count(root))
            .where(predicates.toArray(new Predicate[0]));
        return entityManager.createQuery(criteriaQuery).getSingleResult();
    }

    /**
     * 构造宠物查询的过滤条件。
     */
    private List<Predicate> buildPetPredicates(
        CriteriaBuilder criteriaBuilder,
        Root<PetJpaEntity> root,
        Species species,
        PetStatus status
    ) {
        List<Predicate> predicates = new ArrayList<>();
        if (species != null) {
            predicates.add(criteriaBuilder.equal(root.get(FIELD_SPECIES), species));
        }
        if (status != null) {
            predicates.add(criteriaBuilder.equal(root.get(FIELD_STATUS), status));
        }
        return predicates;
    }

    /**
     * 将 PageQuery 转换为 setFirstResult 所需的 int offset。
     *
     * @throws IllegalArgumentException 当 offset 超过 int 上限时抛出
     */
    private int resolveOffset(PageQuery pageQuery) {
        long offset = (long) pageQuery.page() * pageQuery.size();
        if (offset > Integer.MAX_VALUE) {
            throw new IllegalArgumentException("page offset too large");
        }
        return (int) offset;
    }
}
