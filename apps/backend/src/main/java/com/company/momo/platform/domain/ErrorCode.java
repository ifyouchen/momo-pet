package com.company.momo.platform.domain;

/**
 * platform 限界上下文错误码，作为后端异常和前端错误态之间的稳定契约。
 */
public enum ErrorCode {

    /**
     * 请求参数未通过接口层校验。
     */
    VALIDATION_FAILED("参数校验失败"),

    /**
     * 请求路径不存在，通常来自浏览器误访问后端根路径或静态资源。
     */
    NOT_FOUND("请求资源不存在"),

    /**
     * 请求的宠物不存在或不属于当前用户。
     */
    PET_NOT_FOUND("宠物不存在"),

    /**
     * 当前 MVP 不支持请求中的宠物类型。
     */
    SPECIES_UNSUPPORTED("暂不支持这种宠物类型"),

    /**
     * 宠物当前饱食度过高，不能继续喂食。
     */
    PET_ALREADY_FULL("它已经吃饱啦"),

    /**
     * 当前状态不允许执行该照顾行为。
     */
    CARE_ACTION_NOT_ALLOWED("现在不能这样照顾它"),

    /**
     * 请求的清理事件不存在。
     */
    CLEAN_EVENT_NOT_FOUND("现在没有需要清理的东西"),

    /**
     * 上传资源格式不在 MVP 支持范围内。
     */
    ASSET_TYPE_UNSUPPORTED("只支持 JPG、PNG 或 WebP"),

    /**
     * 上传资源超过 MVP 单文件大小限制。
     */
    ASSET_TOO_LARGE("单张图片不能超过 10 MB"),

    /**
     * 上传资源保存失败。
     */
    ASSET_UPLOAD_FAILED("照片上传失败了，可以重试"),

    /**
     * 请求的资源不存在。
     */
    ASSET_NOT_FOUND("照片资源不存在"),

    /**
     * 请求的资源尚未可用。
     */
    ASSET_NOT_READY("照片资源还没有准备好"),

    /**
     * 请求的资源不属于当前宠物。
     */
    ASSET_OWNER_MISMATCH("照片资源不属于当前宠物"),

    /**
     * 创建 Pet DNA 任务时缺少主图。
     */
    PRIMARY_PHOTO_REQUIRED("需要先上传一张主图"),

    /**
     * 参考图数量超过 MVP 限制。
     */
    REFERENCE_PHOTO_LIMIT_EXCEEDED("最多上传 4 张参考图"),

    /**
     * 请求的 AI 任务不存在。
     */
    AI_TASK_NOT_FOUND("AI 任务不存在"),

    /**
     * 当前 MVP 不支持请求的 AI 任务类型。
     */
    AI_TASK_TYPE_UNSUPPORTED("暂不支持这种 AI 任务"),

    /**
     * AI 生成失败。
     */
    AI_GENERATION_FAILED("AI 生成失败，可以先手动创建"),

    /**
     * AI 生成超过等待时间。
     */
    AI_GENERATION_TIMEOUT("AI 分析时间有点久"),

    /**
     * AI 输出未通过结构校验。
     */
    AI_RESULT_INVALID("AI 结果暂时不可用"),

    /**
     * 用户确认的 Pet DNA 未通过业务校验。
     */
    PET_DNA_INVALID("Pet DNA 信息不完整"),

    /**
     * 系统出现未预期异常。
     */
    INTERNAL_ERROR("系统异常");

    private final String message;

    ErrorCode(String message) {
        this.message = message;
    }

    /**
     * 返回适合展示给用户的默认错误文案。
     *
     * @return 默认错误文案
     */
    public String message() {
        return message;
    }
}
