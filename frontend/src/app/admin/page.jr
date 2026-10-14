import React from 'react';

export default function LeaderAdminDashboard() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#f1f5f9' }}>
      {/* Sidebar Navigation */}
      <aside style={{ width: '260px', backgroundColor: '#0f172a', color: '#fff', padding: '24px 16px' }}>
        <div style={{ borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>
            LivingDocs System
          </h2>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Leader Control Center</span>
        </div>

        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ padding: '12px 16px', backgroundColor: '#1e293b', borderRadius: '6px', color: '#38bdf8', marginBottom: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              📊 Giám sát Hệ thống
            </li>
            <li style={{ padding: '12px 16px', color: '#cbd5e1', marginBottom: '8px', cursor: 'pointer' }}>
              📑 Xét duyệt Tài liệu
            </li>
            <li style={{ padding: '12px 16px', color: '#cbd5e1', marginBottom: '8px', cursor: 'pointer' }}>
              📥 Dead Letter Queue (DLQ)
            </li>
            <li style={{ padding: '12px 16px', color: '#cbd5e1', marginBottom: '8px', cursor: 'pointer' }}>
              👥 Quản lý Thành viên
            </li>
            <li style={{ padding: '12px 16px', color: '#cbd5e1', marginBottom: '8px', cursor: 'pointer' }}>
              📜 System Audit Logs
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Panel Content */}
      <main style={{ flex: 1, padding: '32px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
              Bảng Quản Lý Dành Cho Leader
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
              Theo dõi hạ tầng Microservices, trạng thái Kafka DLQ và luồng hoạt động
            </p>
          </div>
          <div style={{ padding: '8px 16px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
            👑 Role: Team Leader / Admin
          </div>
        </header>

        {/* System Health Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>POSTGRESQL DB</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a', marginTop: '8px' }}>Active (Port 5432)</div>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>REDIS CACHE</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a', marginTop: '8px' }}>Active (Port 6379)</div>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>KAFKA BROKER</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a', marginTop: '8px' }}>Active (Port 9092)</div>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>DLQ MESSAGES</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb', marginTop: '8px' }}>0 Lỗi tồn đọng</div>
          </div>
        </div>

        {/* System Logs Table */}
        <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '16px' }}>
            Nhật Ký & Hoạt Động Gần Đây
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px' }}>Thời gian</th>
                <th style={{ padding: '12px' }}>Dịch vụ</th>
                <th style={{ padding: '12px' }}>Sự kiện</th>
                <th style={{ padding: '12px' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', color: '#64748b' }}>Vừa xong</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>Docker Infrastructure</td>
                <td style={{ padding: '12px' }}>Khởi tạo dịch vụ Postgres, Redis, Kafka, DLQ UI</td>
                <td style={{ padding: '12px', color: '#16a34a', fontWeight: 'bold' }}>SUCCESS</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', color: '#64748b' }}>10 phút trước</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>Next.js Frontend</td>
                <td style={{ padding: '12px' }}>Dựng khung giao diện Leader UI Admin Panel</td>
                <td style={{ padding: '12px', color: '#16a34a', fontWeight: 'bold' }}>SUCCESS</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}