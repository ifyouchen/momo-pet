package com.company.momo.asset.interfaces;

import com.company.momo.asset.application.UploadPetPhotoApplicationService;
import com.company.momo.asset.domain.PhotoRole;
import com.company.momo.platform.interfaces.common.ApiResponse;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * asset Interface 层 Controller，负责宠物照片上传入口。
 */
@RestController
public class PetPhotoController {

    private final UploadPetPhotoApplicationService uploadPetPhotoApplicationService;

    public PetPhotoController(UploadPetPhotoApplicationService uploadPetPhotoApplicationService) {
        this.uploadPetPhotoApplicationService = uploadPetPhotoApplicationService;
    }

    /**
     * 上传单张宠物照片。
     *
     * @param petId 宠物 ID
     * @param file 上传文件
     * @param photoRole 照片角色
     * @return 上传响应
     */
    @PostMapping("/api/pets/{petId}/photos")
    public ApiResponse<PhotoUploadResponse> uploadPhoto(
        @PathVariable String petId,
        @RequestParam("file") MultipartFile file,
        @RequestParam("photoRole") String photoRole
    ) {
        return ApiResponse.success(PhotoUploadResponse.from(
            uploadPetPhotoApplicationService.uploadPhoto(petId, file, PhotoRole.parse(photoRole))
        ));
    }
}
