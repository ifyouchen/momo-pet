package com.company.momo.asset.domain;

/**
 * asset 限界上下文资源状态，用于避免失败文件被 AI 任务引用。
 */
public enum AssetStatus {
    /**
     * 资源已经保存并可被业务引用。
     */
    READY,

    /**
     * 资源保存失败或不可用。
     */
    FAILED
}
