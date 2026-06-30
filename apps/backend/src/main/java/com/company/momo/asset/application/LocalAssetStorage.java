package com.company.momo.asset.application;

import com.company.momo.asset.domain.AssetId;
import com.company.momo.asset.domain.StorageKey;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

/**
 * asset Application 层本地存储端口实现，Sprint 5 用本地文件替代对象存储。
 */
@Component
public class LocalAssetStorage {

    private final Path rootPath;

    public LocalAssetStorage(@Value("${momo.storage.local-root:./data/uploads}") String localRoot) {
        this.rootPath = Path.of(localRoot);
    }

    /**
     * 保存上传文件并返回相对 storage key。
     *
     * @param assetId 资源 ID
     * @param file 上传文件
     * @return 存储 key
     */
    public StorageKey saveOriginalPhoto(AssetId assetId, MultipartFile file) {
        try {
            Files.createDirectories(rootPath);
            Path target = rootPath.resolve(assetId.value() + extensionOf(file.getOriginalFilename()));
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return new StorageKey(rootPath.relativize(target).toString().replace('\\', '/'));
        } catch (IOException exception) {
            throw new BusinessException(ErrorCode.ASSET_UPLOAD_FAILED);
        }
    }

    private String extensionOf(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".bin";
        }
        return filename.substring(filename.lastIndexOf('.')).toLowerCase();
    }
}
