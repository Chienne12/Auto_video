# 🎨 UI/UX WIREFRAMES - TIKTOK VIDEO AUTOMATION

Thư mục này chứa tất cả wireframes và tài liệu thiết kế UI cho hệ thống TikTok Video Automation.

---

## 📁 DANH SÁCH FILES

### 📋 Tài liệu chức năng
- **FEATURES_LIST.md** - Danh sách đầy đủ các chức năng hệ thống

### 🖼️ Wireframes (Draw.io format)

1. **wireframe_dashboard.drawio** - Màn hình chính
   - Stats cards (Videos hôm nay, Chi phí, Tỷ lệ thành công)
   - Quick action "Tạo Video Mới"
   - Danh sách videos gần đây
   
2. **wireframe_create_video.drawio** - Tạo video mới
   - Upload ảnh sản phẩm (drag & drop)
   - Form thông tin sản phẩm
   - Chọn loại video (Narrative/Motion/Montage)
   - Tùy chọn giọng đọc & phụ đề
   - Ước tính chi phí
   
3. **wireframe_gallery.drawio** - Thư viện video
   - Filter & search
   - Grid layout videos
   - Status indicators
   - Pagination
   
4. **wireframe_settings.drawio** - Cài đặt
   - Cấu hình API keys
   - Video preferences
   - Storage management
   - System info
   
5. **wireframe_reports.drawio** - Báo cáo & phân tích
   - Summary stats
   - Charts (Line chart, Pie chart)
   - Activity table
   - Export PDF

---

## 🎯 CÁC MÀN HÌNH CHÍNH

### 1. Dashboard (Trang chủ)
**Mục đích**: Hiển thị tổng quan và truy cập nhanh

**Thành phần**:
- Navigation bar
- 4 stats cards
- Nút "Tạo Video Mới" nổi bật
- Danh sách videos gần đây (grid 3 cột)

### 2. Create Video (Tạo video)
**Mục đích**: Form để tạo video mới

**Thành phần**:
- Upload zone (drag & drop)
- Image preview grid
- Product info form
- Intent selection (radio buttons)
- Voice & subtitle options
- Preview config
- Create button

### 3. Video Gallery (Thư viện)
**Mục đích**: Xem và quản lý tất cả videos

**Thành phần**:
- Search bar
- Filter dropdowns (Status, Date, Sort)
- Video grid with thumbnails
- Action buttons (Xem, Tải về, Xóa)
- Pagination

### 4. Settings (Cài đặt)
**Mục đích**: Cấu hình hệ thống

**Thành phần**:
- API configuration section
- Video defaults section
- Storage management
- System info
- Save button

### 5. Reports (Báo cáo)
**Mục đích**: Phân tích và thống kê

**Thành phần**:
- Time range filter
- 4 summary cards
- Line chart (Videos over time)
- Pie chart (Cost breakdown)
- Activity table
- Export button

---

## 🎨 DESIGN SYSTEM

### Màu sắc chính
- **Primary**: #0066cc (Blue)
- **Success**: #4CAF50 (Green)
- **Warning**: #ff9800 (Orange)
- **Error**: #ff4444 (Red)
- **Dark**: #1a1a1a (Header)
- **Light**: #f5f5f5 (Background)

### Typography
- **Headers**: Bold, 16-28px
- **Body**: Regular, 12-14px
- **Monospace**: Courier New (API keys, paths)

### Components
- **Buttons**: Rounded corners (border-radius: 4px)
- **Cards**: Shadow, white background
- **Inputs**: Border, 40px height
- **Stats cards**: Colored backgrounds

### Layout
- **Grid**: 3 columns for videos
- **Spacing**: 10-50px between sections
- **Max width**: 1400px
- **Responsive**: Mobile-first approach

---

## 🚀 CÁCH XEM WIREFRAMES

### Option 1: Draw.io Online
```
1. Mở https://app.diagrams.net
2. File → Open from → Device
3. Chọn file .drawio
```

### Option 2: VS Code Extension
```
1. Install "Draw.io Integration" extension
2. Click vào file .drawio
```

### Option 3: Desktop App
```
1. Download từ https://www.diagrams.net/
2. Open file .drawio
```

---

## 📝 USER FLOWS

### Flow 1: Tạo video mới
```
Dashboard → Click "Tạo Video Mới" → 
Upload ảnh → Nhập thông tin → 
Chọn loại video → Click "Tạo Video" → 
Xem progress → Hoàn thành → Gallery
```

### Flow 2: Xem video đã tạo
```
Dashboard/Gallery → Click video card → 
Video preview → Download/Share
```

### Flow 3: Cấu hình API
```
Settings → API Configuration → 
Nhập API key → Test connection → 
Save settings
```

---

## ✨ FEATURES CHI TIẾT

### Upload ảnh
- ✅ Drag & drop
- ✅ Multi-file upload
- ✅ Image preview
- ✅ Remove individual images
- ✅ Supported: JPG, PNG, WEBP

### Video creation
- ✅ Real-time progress tracking
- ✅ Cancel operation
- ✅ Cost estimation
- ✅ Time estimation
- ✅ Preview configuration

### Video management
- ✅ Filter by status
- ✅ Filter by date
- ✅ Search by name
- ✅ Sort options
- ✅ Bulk actions (future)

### Reports
- ✅ Interactive charts
- ✅ Date range selection
- ✅ Export to PDF
- ✅ Cost breakdown
- ✅ Activity history

---

## 🔄 NEXT STEPS

1. **High-Fidelity Mockups**: Tạo mockups chi tiết với màu sắc thật
2. **Prototype**: Tạo prototype interactive
3. **User Testing**: Test với người dùng thực
4. **Implementation**: Code UI theo wireframes
5. **Responsive**: Tối ưu cho mobile/tablet

---

## 📞 CONTACT

Nếu có câu hỏi về wireframes hoặc cần chỉnh sửa, vui lòng liên hệ team design.

**Version**: 1.0  
**Last Updated**: 10/12/2024  
**Status**: ✅ Hoàn thành wireframes cơ bản
