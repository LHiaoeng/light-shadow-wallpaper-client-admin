/**
 * 云存储服务商
 */
export enum OssProviderEnum {
  // 又拍云
  UPYUN = 'upyun'
}

/**
 * 公告信息查询对象
 */
export type UploadOssInfo = {
  // 云存储服务商
  ossProvider?: OssProviderEnum[]
  // 上传目录
  uploadDirectory?: string
}

/**
 * 上传文件返回信息
 */
export type OssFileInfo = {
  // 文件地址
  url?: string
  // 图片缩略图
  thumbnailUrl?: string
}
