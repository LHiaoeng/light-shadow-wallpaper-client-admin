<script setup lang="ts">
import { useModal } from '@/hooks/modal'
import type { WallpaperDTO } from '@/api/wallpaper/wallpaper/types'
import {
  createWallpaperUrl,
  deleteWallpaperUrl,
  getWallpaperUrlList,
  setWallpaper
} from '@/api/wallpaper/wallpaperUrl'
import FileAnalyzer from '@/components/FileAnalyzer/index.vue'
import type { WallpaperUrlDTO } from '@/api/wallpaper/wallpaperUrl/types'
import { message } from 'ant-design-vue'

const { title, visible, openModal, closeModal } = useModal()

const emits = defineEmits<{
  (e: 'submit-success'): void
}>()

const wallpaper = ref<WallpaperDTO>()

const submitLoading = ref(false)
const wallpaperUrlList = ref<WallpaperUrlDTO[]>([])
const analyzeSpinning = ref<boolean>(false)

const handleSubmit = () => {
  closeModal()
  emits('submit-success')
}

/* 弹窗关闭方法 */
const handleClose = () => {
  closeModal()
  submitLoading.value = false
}

const getUrlList = (wallpaperId: number) => {
  getWallpaperUrlList({ wallpaperId: wallpaperId }).then(res => {
    if (res.code === 200) {
      wallpaperUrlList.value = res.data
      if (wallpaperUrlList.value.length === 0) {
        message.success('暂无数据')
      }
    } else {
      message.error(res.message)
    }
  })
}

const addWallpaperUrl = (wallpaperUrlDTO: WallpaperUrlDTO) => {
  if (wallpaper.value) {
    wallpaperUrlDTO.wallpaperId = wallpaper.value.id
  }

  analyzeSpinning.value = true
  createWallpaperUrl(wallpaperUrlDTO)
    .then(res => {
      if (res.code === 200) {
        wallpaperUrlList.value.push(res.data)
        fileUrl.value = ''
      } else {
        message.error(res.message)
      }
    })
    .finally(() => {
      analyzeSpinning.value = false
    })
}

const delWallpaperUrl = (id: number) => {
  deleteWallpaperUrl(id).then(res => {
    if (res.code === 200) {
      message.success('删除成功')
      wallpaperUrlList.value = wallpaperUrlList.value.filter(item => item.id !== id)
    } else {
      message.error(res.message)
    }
  })
}

const setWallpaperUrl = (wallpaperUrlDTO: WallpaperUrlDTO) => {
  setWallpaper(wallpaperUrlDTO).then(res => {
    if (res.code === 200) {
      message.success('设置成功')
      if (wallpaper.value) {
        getUrlList(wallpaper.value.id)
      }
    } else {
      message.error(res.message)
    }
  })
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    const kilobytes = bytes / 1024 // 1 KB = 1024 bytes
    return Math.floor(kilobytes) + ' KB' // 保留整数部分
  } else {
    const megabytes = bytes / (1024 * 1024) // 1 MB = 1024 * 1024 bytes
    return Math.floor(megabytes) + ' MB' // 保留整数部分
  }
}

const fileInfo = ref<WallpaperUrlDTO | null>(null)
const fileUrl = ref<string>('')

watch(fileInfo, newValue => {
  if (newValue) {
    if (wallpaperUrlList.value.filter(item => item.url === newValue.url).length === 0) {
      addWallpaperUrl(newValue)
    } else {
      message.error('该文件已存在')
    }
  }
})

defineExpose({
  open(record: WallpaperDTO) {
    openModal()
    title.value = '源管理'

    wallpaper.value = record
    getUrlList(record.id)
  }
})
</script>

<template>
  <a-modal
    :title="title"
    :visible="visible"
    :mask-closable="false"
    :body-style="{ paddingBottom: '8px' }"
    :confirm-loading="submitLoading"
    :width="800"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <a-spin :spinning="analyzeSpinning" tip="分析中...">
      <FileAnalyzer v-model:fileInfo="fileInfo" />
    </a-spin>
    <a-divider />
    <div class="wallpaper-url-list">
      <a-empty v-if="wallpaperUrlList.length === 0" />
      <a-row v-if="wallpaperUrlList.length > 0" :gutter="[16, 16]">
        <a-col v-for="item in wallpaperUrlList" :key="item.id" :span="8">
          <a-card hoverable>
            <template #cover>
              <div class="media-container">
                <div class="content">
                  <img
                    v-if="item.fileType === 1"
                    :alt="wallpaper?.title"
                    :src="item.url"
                    referrerpolicy="no-referrer"
                  />
                  <video v-else :src="item.url" :poster="item.poster" controls />
                </div>
              </div>
            </template>
            <template #actions>
              <a-popconfirm
                title="确定设置为壁纸地址吗？"
                ok-text="确认"
                cancel-text="取消"
                @confirm="setWallpaperUrl(item)"
              >
                <CheckOutlined title="设置为壁纸地址" />
              </a-popconfirm>
              <a-popconfirm
                title="确定删除吗？"
                ok-text="确认"
                cancel-text="取消"
                @confirm="delWallpaperUrl(item.id)"
              >
                <DeleteOutlined key="del" />
              </a-popconfirm>
            </template>
            <a-card-meta>
              <template #description>
                <a-descriptions size="small" :column="1">
                  <a-descriptions-item label="地址">
                    <a-typography-link
                      :href="item.url"
                      target="_blank"
                      :copyable="{ tooltip: false }"
                      :ellipsis="true"
                      :content="item.url"
                      :style="{ width: '120px' }"
                      :title="item.url"
                    >
                    </a-typography-link>
                  </a-descriptions-item>
                  <a-descriptions-item label="缩略图">
                    <a-typography-link
                      :href="item.poster"
                      target="_blank"
                      :copyable="{ tooltip: false }"
                      :ellipsis="true"
                      editable
                      :content="item.poster"
                      :style="{ width: '100px' }"
                      :title="item.poster"
                    >
                    </a-typography-link>
                  </a-descriptions-item>
                  <a-descriptions-item label="文件类型">{{
                    item.fileType === 1 ? '图片' : '视频'
                  }}</a-descriptions-item>
                  <a-descriptions-item v-if="item.size" label="文件大小">{{
                    formatSize(item.size)
                  }}</a-descriptions-item>
                  <a-descriptions-item label="分辨率"
                    ><span v-if="item.width"
                      >{{ item.width }} x {{ item.height }}</span
                    ></a-descriptions-item
                  >
                  <a-descriptions-item label="视频时长">
                    <span v-if="item.duration">{{ item.duration }}秒</span></a-descriptions-item
                  >
                  <a-descriptions-item label="备注">{{ item.note }}</a-descriptions-item>
                </a-descriptions>
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </a-modal>
</template>

<style scoped lang="less">
.wallpaper-url-list {
  background-color: #ececec;
  padding: 20px;

  ::v-deep(.ant-card-cover) {
    .media-container {
      width: 100%; // 宽度自适应
      height: 0;
      padding-top: 56.25%; // 16:9 的高度比 (9 / 16 * 100)
      position: relative; // 设置相对定位以使子元素绝对定位

      .content {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;

        img,
        video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
}
</style>
