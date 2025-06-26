# Teacher MyClasses Components

Thư mục này chứa các component đã được tách ra từ file `MyClasses.jsx` để module hóa chương trình.

## Cấu trúc

### 1. ClassDetailModal.jsx

- **Chức năng**: Modal xem chi tiết lớp học
- **Tính năng**:
  - Hiển thị thông tin cơ bản của lớp học
  - Hiển thị lịch học và thông tin phòng học
  - Hiển thị danh sách học sinh trong lớp
  - Xem lịch sử điểm danh của từng học sinh
- **Props**:
  - `open`: Boolean - Trạng thái mở/đóng modal
  - `onClose`: Function - Callback khi đóng modal
  - `classData`: Object - Dữ liệu lớp học

### 2. AttendanceModal.jsx

- **Chức năng**: Modal điểm danh học sinh
- **Tính năng**:
  - Hiển thị danh sách học sinh trong lớp
  - Điểm danh với 3 trạng thái: Có mặt, Vắng, Đi muộn
  - Ghi chú cho từng học sinh
  - Thống kê tổng quan điểm danh
  - Lưu điểm danh vào database
- **Props**:
  - `open`: Boolean - Trạng thái mở/đóng modal
  - `onClose`: Function - Callback khi đóng modal
  - `classData`: Object - Dữ liệu lớp học

### 3. AttendanceHistoryModal.jsx

- **Chức năng**: Modal xem lịch sử điểm danh
- **Tính năng**:
  - Hiển thị lịch sử điểm danh của lớp học
  - Thống kê theo ngày
  - Hiển thị tỷ lệ có mặt
- **Props**:
  - `open`: Boolean - Trạng thái mở/đóng modal
  - `onClose`: Function - Callback khi đóng modal
  - `classData`: Object - Dữ liệu lớp học

### 4. StudentHistoryModal.jsx

- **Chức năng**: Modal xem lịch sử điểm danh của học sinh
- **Tính năng**:
  - Hiển thị lịch sử điểm danh của một học sinh cụ thể
  - Hiển thị trạng thái và ghi chú theo từng ngày
- **Props**:
  - `open`: Boolean - Trạng thái mở/đóng modal
  - `onClose`: Function - Callback khi đóng modal
  - `student`: Object - Dữ liệu học sinh
  - `history`: Array - Lịch sử điểm danh

## Lợi ích của việc module hóa

1. **Dễ bảo trì**: Mỗi component có trách nhiệm riêng biệt, dễ sửa đổi và debug
2. **Tái sử dụng**: Các component có thể được sử dụng ở nhiều nơi khác nhau
3. **Code sạch hơn**: File chính `MyClasses.jsx` ngắn gọn và dễ đọc hơn
4. **Phân chia trách nhiệm**: Mỗi component chỉ xử lý một chức năng cụ thể
5. **Dễ test**: Có thể test từng component riêng biệt

## Cách sử dụng

```jsx
import ClassDetailModal from "./components/ClassDetailModal";
import AttendanceModal from "./components/AttendanceModal";
import AttendanceHistoryModal from "./components/AttendanceHistoryModal";
import StudentHistoryModal from "./components/StudentHistoryModal";

// Trong component chính
const [detailModalOpen, setDetailModalOpen] = useState(false);
const [selectedClass, setSelectedClass] = useState(null);

const handleOpenDetail = (classItem) => {
  setSelectedClass(classItem);
  setDetailModalOpen(true);
};

// Render
<ClassDetailModal
  open={detailModalOpen}
  onClose={() => setDetailModalOpen(false)}
  classData={selectedClass}
/>;
```

## API Calls

Các component sử dụng các API calls từ `services/api.js`:

- `getClassByIdAPI`: Lấy thông tin chi tiết lớp học
- `getStudentsInClassAPI`: Lấy danh sách học sinh trong lớp
- `getTodayAttendanceAPI`: Lấy điểm danh hôm nay
- `getAttendanceListAPI`: Lấy lịch sử điểm danh
- `updateAttendanceAPI`: Cập nhật điểm danh
