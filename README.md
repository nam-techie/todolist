# 📝 TaskFlow - Modern TodoList Application

## 🌟 Tổng quan

TaskFlow là một ứng dụng quản lý công việc hiện đại với giao diện tối, được thiết kế để giúp bạn tổ chức và theo dõi các nhiệm vụ một cách hiệu quả. Ứng dụng lấy cảm hứng từ các công cụ productivity hàng đầu và tích hợp nhiều tính năng mạnh mẽ.

## ✨ Tính năng chính

### 1. 📋 Quản lý Task đầy đủ (CRUD)
- **Tạo task**: Thêm task mới với đầy đủ thông tin
- **Chỉnh sửa**: Cập nhật thông tin task bất kỳ lúc nào
- **Xóa task**: Loại bỏ task không cần thiết
- **Đánh dấu hoàn thành**: Toggle trạng thái completed/pending

### 2. 💾 Lưu trữ dữ liệu
- **Local Storage**: Dữ liệu được lưu trực tiếp trên trình duyệt
- **Persistent**: Dữ liệu không bị mất khi reload trang
- **Auto-save**: Tự động lưu mọi thay đổi

### 3. 🎯 3 Giao diện xem khác nhau

#### 📋 List View
- **Tìm kiếm**: Search theo title, description, tags
- **Lọc nâng cao**: Filter theo status, priority, tags, overdue
- **Sắp xếp**: Sort theo deadline, priority, created date
- **Hiển thị chi tiết**: Thông tin đầy đủ về từng task

#### 📅 Calendar View  
- **Lịch tháng/tuần**: Xem task theo định dạng calendar
- **Click ngày**: Chọn ngày để xem tasks due trong ngày đó
- **Visual timeline**: Nhìn thấy distribution của tasks theo thời gian
- **Due date highlighting**: Màu sắc phân biệt độ ưu tiên thời gian

#### 📊 Analytics View
- **Tổng số tasks**: Thống kê tổng quan
- **Tỷ lệ hoàn thành**: Phần trăm completion rate  
- **Phân bố theo priority**: Charts hiển thị distribution
- **Tasks hoàn thành theo ngày/tuần**: Timeline charts
- **Progress tracking**: Theo dõi tiến độ theo thời gian

### 4. ⏰ Xử lý thời gian/ngày giờ

#### Due Date Management
- **Trường dueAt, createdAt, updatedAt**: Timestamp đầy đủ
- **estimatedMinutes**: Ước tính thời gian hoàn thành

#### Overdue Highlighting  
- **🔴 Đỏ**: Overdue hoặc còn ≤ 1 ngày
- **🟡 Vàng**: Còn ≤ 3 ngày  
- **🟢 Xanh lá**: Còn ≤ 7 ngày
- **🔵 Xanh dương**: Còn > 7 ngày

#### Time Display
- **Countdown**: "Due in 3 hours", "Due in 2 days"
- **Sort theo deadline**: Sắp xếp theo thời gian còn lại
- **Filter theo khoảng thời gian**: Today, This week, etc.

### 5. 🚀 Hiệu suất với 20+ items
- **Tìm kiếm hiệu quả**: Search algorithm tối ưu
- **Filter nhanh**: Multiple filter criteria
- **Virtual scrolling**: (Tùy chọn) Pagination hoặc virtual list
- **Lazy loading**: Load dữ liệu theo demand
- **Debounced search**: Tránh lag khi typing

### 6. 🎨 Trải nghiệm người dùng tốt

#### Form Validation
- **Thêm/sửa có validate**: Required fields, format checking
- **Error handling**: Thông báo lỗi rõ ràng
- **Success feedback**: Confirmation khi thành công

#### Confirm khi xóa
- **Modal confirmation**: Xác nhận trước khi delete
- **Undo option**: Có thể hoàn tác trong một số trường hợp

#### Empty States
- **Không có task**: Hiển thị message và CTA phù hợp
- **No search results**: Gợi ý cách tìm kiếm khác
- **Empty workspace**: Hướng dẫn tạo task đầu tiên

#### Responsive Design
- **Mobile-first**: Tối ưu cho mobile
- **Keyboard shortcuts**: Hỗ trợ navigation bằng phím
- **Focus states**: Accessibility tốt
- **Touch-friendly**: Buttons và interactions phù hợp touch

## 🏢 Tính năng nâng cao

### 📁 Workspace Management
- **Tạo workspace**: Gym, Work, Study, Personal, etc.
- **Custom icons**: 16 icons để chọn (💪, 💼, 📚, 🎯, etc.)
- **Custom colors**: 8 màu chủ đạo
- **Workspace switching**: Chuyển đổi nhanh giữa các workspace
- **Isolated tasks**: Mỗi workspace có tasks riêng biệt

### ⏱️ Focus Timer (Pomodoro)
- **Multiple durations**: 25, 45, 60, 90, 120 phút
- **Visual countdown**: Circular progress bar
- **Auto break**: Tự động chuyển sang break time (5-15 phút)
- **Session tracking**: Đếm số sessions đã hoàn thành
- **Notifications**: Browser notifications khi hết giờ
- **Background audio**: Notification sound
- **Play/Pause/Stop**: Full control

### 🏷️ Task Properties
- **Priority levels**: Low, Medium, High, Urgent
- **Status tracking**: Pending, In Progress, Completed
- **Tags system**: Multiple tags per task
- **Description**: Rich text description
- **Time estimation**: Estimated minutes to complete

## 🎨 Thiết kế UI/UX

### 🌙 Dark Theme
- **Primary colors**: Dark grays (#0a0a0a, #1a1a1a, #2a2a2a)
- **Accent color**: Green (#22c55e) - có thể thay đổi theo workspace
- **Text colors**: White/gray hierarchy cho readability
- **Consistent spacing**: 8px grid system

### 🎭 Visual Design
- **Modern cards**: Subtle shadows, rounded corners
- **Smooth animations**: Transitions và micro-interactions
- **Color coding**: Priority và status có màu riêng biệt
- **Typography**: Clear hierarchy với multiple font weights
- **Icons**: Lucide React icons set

### 📱 Responsive Layout
- **Mobile sidebar**: Collapsible navigation
- **Adaptive grid**: Responsive columns
- **Touch optimization**: Button sizes và spacing
- **Keyboard navigation**: Full keyboard support

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build tool**: Vite
- **Storage**: Browser localStorage
- **State management**: React hooks (useState, useEffect, useMemo)

## 🚀 Cài đặt và chạy

```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📖 Hướng dẫn sử dụng

### Tạo Task mới
1. Click nút "Add Task" ở header
2. Điền thông tin: title, description, priority, due date
3. Chọn workspace và thêm tags nếu cần
4. Click "Create Task"

### Quản lý Workspace
1. Click icon Settings ở sidebar
2. Tạo workspace mới với tên, icon và màu
3. Switch giữa các workspace bằng sidebar
4. Mỗi workspace sẽ có tasks riêng biệt

### Sử dụng Focus Timer
1. Click "Focus Timer" ở header
2. Chọn thời gian focus (25-120 phút)
3. Click Play để bắt đầu
4. Nghỉ giải lao khi timer kết thúc
5. Theo dõi số sessions đã hoàn thành

### Xem Analytics
1. Chuyển sang Analytics view
2. Xem tổng quan về productivity
3. Theo dõi completion rate
4. Phân tích distribution theo priority
5. Xem progress theo thời gian

## 🔮 Tính năng tương lai

- [ ] **Sync cloud**: Đồng bộ dữ liệu qua cloud
- [ ] **Team collaboration**: Chia sẻ workspace với team
- [ ] **Advanced analytics**: Deeper insights và reports
- [ ] **Mobile app**: React Native version
- [ ] **Integrations**: Calendar, Slack, Notion integrations
- [ ] **AI suggestions**: Smart task prioritization
- [ ] **Habit tracking**: Recurring tasks và habits
- [ ] **Time tracking**: Actual time spent vs estimated

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

---

**TaskFlow** - Organize your tasks, focus your mind, achieve your goals! 🎯