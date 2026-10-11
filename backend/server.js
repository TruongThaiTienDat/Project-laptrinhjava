const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

const DB_FILE = path.join(__dirname, 'database.json');

// Hàm đọc dữ liệu từ file cứng database.json
function readData() {
    if (!fs.existsSync(DB_FILE)) {
        // Nếu file chưa tồn tại, khởi tạo dữ liệu mặc định ban đầu
        const initialData = {
            documents: [
                { id: 1, title: "README.md", content: "Huong dan du an", status: "DRAFT", version: "1.0" }
            ],
            changeLogs: []
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Hàm ghi lưu dữ liệu xuống file cứng database.json
function writeData(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Hàm tự động ghi lại lịch sử thay đổi (Change Log)
function logChange(docId, actionRole, fromStatus, toStatus, note) {
    const data = readData();
    const newLog = {
        id: data.changeLogs.length + 1,
        documentId: docId,
        role: actionRole, // AI, Staff, hoặc Manager
        fromStatus: fromStatus,
        toStatus: toStatus,
        timestamp: new Date().toISOString(),
        note: note
    };
    data.changeLogs.push(newLog);
    writeData(data);
}

// =================================================================
// 1. API: DEVELOPER HOẶC AI GỬI TÀI LIỆU ĐI DUYỆT
// =================================================================
app.put('/api/workflow/:id/submit', (req, res) => {
    const data = readData();
    const doc = data.documents.find(d => d.id === parseInt(req.params.id));
    if (!doc) return res.status(404).json({ message: "Khong tim thay tai lieu" });
    
    const oldStatus = doc.status;
    doc.status = "IN_REVIEW";
    writeData(data);

    // Ghi lại nhật ký hệ thống
    logChange(doc.id, "AI/Developer", oldStatus, "IN_REVIEW", "Nop tai lieu de cho Staff kiem duyet");

    res.json({ message: "Da gui len Staff kiem duyet thanh cong", data: doc });
});

// =================================================================
// 2. API DÀNH CHO STAFF: KIỂM TRA VÀ BẤM DUYỆT LẦN 1
// =================================================================
app.put('/api/workflow/:id/staff-approve', (req, res) => {
    const data = readData();
    const doc = data.documents.find(d => d.id === parseInt(req.params.id));
    if (!doc) return res.status(404).json({ message: "Khong tim thay tai lieu" });
    
    // Kiểm tra chặn nếu đi sai luồng quy trình
    if (doc.status !== "IN_REVIEW") {
        return res.status(400).json({ message: "Sai luong quy trinh! Tai lieu phai o trang thai IN_REVIEW" });
    }

    const oldStatus = doc.status;
    doc.status = "APPROVED";
    writeData(data);

    logChange(doc.id, "Staff", oldStatus, "APPROVED", "Staff kiem tra noi dung hop le va chuyen tiep len Manager");

    res.json({ message: "Staff da duyet! Dang cho Manager phe duyet cuoi", data: doc });
});

// =================================================================
// 3. API DÀNH CHO MANAGER: PHÊ DUYỆT CUỐI CÙNG ĐỂ XUẤT BẢN
// =================================================================
app.put('/api/workflow/:id/manager-publish', (req, res) => {
    const data = readData();
    const doc = data.documents.find(d => d.id === parseInt(req.params.id));
    if (!doc) return res.status(404).json({ message: "Khong tim thay tai lieu" });
    
    // Chặn nếu chưa qua bước Staff duyệt
    if (doc.status !== "APPROVED") {
        return res.status(400).json({ message: "Chua the xuat ban! Tai lieu bat buoc phai duoc Staff duyet truoc" });
    }

    const oldStatus = doc.status;
    doc.status = "PUBLISHED";
    
    // Tự động nâng cấp số phiên bản hệ thống lên (Ví dụ từ 1.0 lên 2.0)
    const currentVer = parseFloat(doc.version);
    doc.version = (currentVer + 1.0).toFixed(1);
    
    writeData(data);

    logChange(doc.id, "Manager", oldStatus, "PUBLISHED", `Manager chap thuan xuat ban chinh thuc ban nang cap v${doc.version}`);

    res.json({ message: "Tuyet voi! Tai lieu da duoc Manager phe duyet va xuat ban cong khai", data: doc });
});

// =================================================================
// 4. API TỪ CHỐI (Dành cho ca Staff va Manager khi phat hien tai lieu loi)
// =================================================================
app.put('/api/workflow/:id/reject', (req, res) => {
    const data = readData();
    const doc = data.documents.find(d => d.id === parseInt(req.params.id));
    if (!doc) return res.status(404).json({ message: "Khong tim thay tai lieu" });

    const oldStatus = doc.status;
    doc.status = "REJECTED";
    writeData(data);

    logChange(doc.id, req.body.role || "Reviewer", oldStatus, "REJECTED", req.body.reason || "Tai lieu sai logic code, yeu cau chinh sua lai");

    res.json({ message: "Tai lieu da bi tu choi va tra nguoc ve hang doi chinh sua", data: doc });
});

// =================================================================
// 5. API BỔ SUNG: XEM LỊCH SỬ THAY ĐỔI (CHANGE LOG AUDIT)
// =================================================================
app.get('/api/workflow/:id/logs', (req, res) => {
    const data = readData();
    const logs = data.changeLogs.filter(l => l.documentId === parseInt(req.params.id));
    res.json({ documentId: req.params.id, totalChanges: logs.length, history: logs });
});

app.listen(8080, () => console.log("Server toi uu dang chay tai cong 8080..."));
