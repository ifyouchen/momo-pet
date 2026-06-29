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
