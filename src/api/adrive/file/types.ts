export interface AdriveFileListParam {
  drive_id: string
  parent_file_id: string
  limit?: number
  marker?: string
  type?: 'all' | 'file' | 'folder'
  fields?: string
}

export interface AdriveCreateFileParam {
  drive_id: string
  parent_file_id: string
  name: string
  type: 'file' | 'folder'
  check_name_mode: 'auto_rename' | 'refuse' | 'ignore'
  part_info_list?: Array<{ part_number: number }>
  size?: number
}

export interface AdriveFileItem {
  file_id?: string
  name?: string
  type?: string
  size?: number
  updated_at?: string
  created_at?: string
  [key: string]: unknown
}

export interface AdriveFileListResult {
  items?: AdriveFileItem[]
  next_marker?: string
}
