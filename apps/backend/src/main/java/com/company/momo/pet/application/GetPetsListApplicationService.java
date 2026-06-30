package com.company.momo.pet.application;

import com.company.momo.pet.domain.PetRepository;
import com.company.momo.pet.domain.PetStatus;
import com.company.momo.pet.domain.Species;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * pet 应用服务，查询宠物列表供后台使用。
 */
@Service
public class GetPetsListApplicationService {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    private final PetRepository petRepository;

    public GetPetsListApplicationService(PetRepository petRepository) {
        this.petRepository = petRepository;
    }

    /**
     * 按物种和状态分页查询宠物。
     *
     * @param speciesRaw 物种过滤，可空
     * @param statusRaw 状态过滤，可空
     * @param page 页码
     * @param size 每页大小
     * @return 宠物列表结果
     */
    @Transactional(readOnly = true)
    public PetListResult getPets(String speciesRaw, String statusRaw, int page, int size) {
        Species species = speciesRaw == null || speciesRaw.isBlank() ? null : Species.parse(speciesRaw);
        PetStatus status = statusRaw == null || statusRaw.isBlank() ? null : PetStatus.valueOf(statusRaw);
        int resolvedPage = Math.max(0, page);
        int resolvedSize = size <= 0 ? DEFAULT_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(resolvedPage, resolvedSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<com.company.momo.pet.domain.Pet> result = petRepository.findPets(species, status, pageable);
        return new PetListResult(
            result.getContent().stream().map(PetDetailResult::from).toList(),
            result.getTotalElements(),
            resolvedPage,
            resolvedSize
        );
    }
}
