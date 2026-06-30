package com.company.momo.ai.interfaces;

import com.company.momo.ai.application.AiTaskListResult;
import com.company.momo.ai.application.CreatePetDnaTaskApplicationService;
import com.company.momo.ai.application.CreatePetDnaTaskCommand;
import com.company.momo.ai.application.GetAiTaskApplicationService;
import com.company.momo.ai.application.GetAiTasksListApplicationService;
import com.company.momo.platform.interfaces.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * ai Interface 层 Controller，负责 Pet DNA 任务创建、任务查询和任务列表。
 */
@RestController
public class AiTaskController {

    private final CreatePetDnaTaskApplicationService createPetDnaTaskApplicationService;
    private final GetAiTaskApplicationService getAiTaskApplicationService;
    private final GetAiTasksListApplicationService getAiTasksListApplicationService;

    public AiTaskController(
        CreatePetDnaTaskApplicationService createPetDnaTaskApplicationService,
        GetAiTaskApplicationService getAiTaskApplicationService,
        GetAiTasksListApplicationService getAiTasksListApplicationService
    ) {
        this.createPetDnaTaskApplicationService = createPetDnaTaskApplicationService;
        this.getAiTaskApplicationService = getAiTaskApplicationService;
        this.getAiTasksListApplicationService = getAiTasksListApplicationService;
    }

    /**
     * 创建 Pet DNA 生成任务。
     *
     * @param petId 宠物 ID
     * @param request 创建任务请求
     * @return 创建任务响应
     */
    @PostMapping("/api/pets/{petId}/dna/generation-tasks")
    public ApiResponse<CreateAiTaskResponse> createPetDnaTask(
        @PathVariable String petId,
        @Valid @RequestBody CreatePetDnaTaskRequest request
    ) {
        CreatePetDnaTaskCommand command = new CreatePetDnaTaskCommand(
            request.name(),
            request.speciesHint(),
            request.primaryPhotoAssetId(),
            request.referencePhotoAssetIds() == null ? List.of() : request.referencePhotoAssetIds(),
            request.userDescription()
        );
        return ApiResponse.success(CreateAiTaskResponse.from(createPetDnaTaskApplicationService.createTask(petId, command)));
    }

    /**
     * 查询 AI 任务状态和结果。
     *
     * @param taskId AI 任务 ID
     * @return AI 任务详情
     */
    @GetMapping("/api/ai/tasks/{taskId}")
    public ApiResponse<AiTaskResponse> getAiTask(@PathVariable String taskId) {
        return ApiResponse.success(AiTaskResponse.from(getAiTaskApplicationService.getTask(taskId)));
    }

    /**
     * 分页查询 AI 任务列表，供后台使用。
     *
     * @param status 状态过滤，可空
     * @param taskType 类型过滤，可空
     * @param page 页码
     * @param size 每页大小
     * @return 任务列表响应
     */
    @GetMapping("/api/ai/tasks")
    public ApiResponse<AiTaskListResponse> listAiTasks(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String taskType,
        @RequestParam(required = false, defaultValue = "0") int page,
        @RequestParam(required = false, defaultValue = "20") int size
    ) {
        AiTaskListResult result = getAiTasksListApplicationService.getTasks(status, taskType, page, size);
        return ApiResponse.success(AiTaskListResponse.from(result));
    }
}
