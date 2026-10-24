'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLivingDocs, sampleAccounts, UserRole, AuthUser } from '@/context/LivingDocsContext';
import { 
  LogIn, 
  Github, 
  Shield, 
  Check, 
  Lock, 
  Mail, 
  UserCheck, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';

// Danh sách định dạng màu sắc cho từng vai trò theo đề cương đồ án
const roleDutiesMap: Record<UserRole, { label: string; avatarColor: string; badgeColor: string }> = {
  Developer: {
    label: 'Developer',
    avatarColor: 'bg-blue-100 text-blue-700 border-blue-200',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  Staff: {
    label: 'Staff Reviewer',
    avatarColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  Manager: {
    label: 'Manager Approver',
    avatarColor: 'bg-amber-100 text-amber-700 border-amber-200',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  'Technical Lead': {
    label: 'Technical Lead',
    avatarColor: 'bg-purple-100 text-purple-700 border-purple-200',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  Administrator: {
    label: 'Administrator',
    avatarColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useLivingDocs();

  // Mặc định chọn tài khoản Staff Reviewer (Nguyễn Thành Đồng)
  const [selectedAccountId, setSelectedAccountId] = useState<string>('user-staff');
  const [email, setEmail] = useState<string>('dong.nguyen@livingdocs.vn');
  const [password, setPassword] = useState<string>('12345678');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Staff');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isAutoFilledFlash, setIsAutoFilledFlash] = useState<boolean>(false);

  // Khi bấm chọn một tài khoản mẫu
  const handleSelectAccount = (account: AuthUser) => {
    setSelectedAccountId(account.id);
    setEmail(account.email);
    setPassword('12345678');
    setSelectedRole(account.role);
    setErrorMsg('');

    // Kích hoạt hiệu ứng nhấp nháy viền xanh nhẹ ở cột trái
    setIsAutoFilledFlash(true);
    setTimeout(() => setIsAutoFilledFlash(false), 700);
  };

  // Xử lý đăng nhập thông thường
  const handleFormLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập email hoặc tên đăng nhập.');
      return;
    }

    const currentRoleLabel = roleDutiesMap[selectedRole]?.label || selectedRole;
    setIsLoading(true);
    setLoadingText(`Đang xác thực quyền truy cập ${currentRoleLabel}...`);
    setErrorMsg('');

    // Khớp tài khoản theo email, tên hoặc role alias
    const matched = sampleAccounts.find(
      acc => acc.email.toLowerCase() === email.trim().toLowerCase() ||
             acc.name.toLowerCase() === email.trim().toLowerCase() ||
             acc.id === email.trim().toLowerCase() ||
             (email.toLowerCase().includes('dev') && acc.role === 'Developer') ||
             (email.toLowerCase().includes('staff') && acc.role === 'Staff') ||
             (email.toLowerCase().includes('manager') && acc.role === 'Manager') ||
             (email.toLowerCase().includes('lead') && acc.role === 'Technical Lead') ||
             (email.toLowerCase().includes('admin') && acc.role === 'Administrator')
    );

    const userToLogin: AuthUser = matched || {
      id: `user-${Date.now()}`,
      name: email.includes('@') ? email.split('@')[0] : email,
      email: email.includes('@') ? email : `${email}@livingdocs.vn`,
      role: selectedRole,
      avatarLetter: (email[0] || 'U').toUpperCase(),
      roleDescription: currentRoleLabel
    };

    setTimeout(() => {
      login(userToLogin);
      router.replace('/');
    }, 500);
  };

  // Đăng nhập với GitHub OAuth
  const handleGithubOAuthLogin = () => {
    const currentRoleLabel = roleDutiesMap[selectedRole]?.label || selectedRole;
    setIsLoading(true);
    setLoadingText(`Đang xác thực OAuth2 GitHub cho ${currentRoleLabel}...`);
    setErrorMsg('');

    const matched = sampleAccounts.find(acc => acc.role === selectedRole) || sampleAccounts[0];
    const oauthUser: AuthUser = {
      ...matched,
      name: `${matched.name} (GitHub)`,
      email: `github.${matched.email}`
    };

    setTimeout(() => {
      login(oauthUser);
      router.replace('/');
    }, 500);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 overflow-hidden select-none">
      {/* Vùng sáng chuyển sắc mờ (Ambient Blur Orbs) ở các góc màn hình */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Lưới kỹ thuật mờ tinh tế tạo chiều sâu nền */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Khung Card chính đăng nhập Enterprise */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-fadeIn transition-all duration-300">
        
        {/* CỘT TRÁI (7/12): Form xác thực hệ thống */}
        <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Header thương hiệu */}
            <div className="space-y-1 pb-3 border-b border-slate-100">
              <div className="inline-flex items-center space-x-2 text-blue-600 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">LivingDocs</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-semibold">
                  Enterprise
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Cổng đăng nhập hệ thống
              </h1>
              <p className="text-xs text-slate-500">
                Nền tảng kiểm soát sai lệch tài liệu kỹ thuật & đồng bộ AST tự động
              </p>
            </div>

            {/* Thông báo lỗi nếu có */}
            {errorMsg && (
              <div className="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700 animate-fadeIn">
                {errorMsg}
              </div>
            )}

            {/* Form đăng nhập */}
            <form onSubmit={handleFormLogin} className="space-y-4">
              {/* Ô Email / Tên đăng nhập */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email / Tên đăng nhập
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@livingdocs.vn"
                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg text-slate-900 bg-white focus:outline-none transition-all duration-300 ${
                      isAutoFilledFlash
                        ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20'
                        : 'border-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* Ô Mật khẩu kèm nút bật/tắt hiển thị */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Ô Vai trò truy cập (RBAC) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vai trò truy cập (RBAC)
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    const newRole = e.target.value as UserRole;
                    setSelectedRole(newRole);
                    const matched = sampleAccounts.find(acc => acc.role === newRole);
                    if (matched) {
                      setSelectedAccountId(matched.id);
                      setEmail(matched.email);
                    }
                  }}
                  className={`w-full px-3 py-2 text-xs border rounded-lg text-slate-900 bg-white focus:outline-none transition-all duration-300 font-medium cursor-pointer ${
                    isAutoFilledFlash
                      ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20'
                      : 'border-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                >
                  <option value="Developer">Developer</option>
                  <option value="Staff">Staff Reviewer</option>
                  <option value="Manager">Manager Approver</option>
                  <option value="Technical Lead">Technical Lead</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              {/* Hàng tùy chọn: Ghi nhớ phiên & Trạng thái bảo mật TLS 1.3 */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center space-x-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Ghi nhớ phiên đăng nhập</span>
                </label>
                <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bảo mật TLS 1.3</span>
                </div>
              </div>

              {/* Nút Đăng nhập chính với dải màu chiều sâu và hiệu ứng nổi */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-75 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{loadingText || 'Đang xác thực quyền truy cập...'}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập hệ thống</span>
                  </>
                )}
              </button>
            </form>

            {/* Ngăn cách Hoặc */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider absolute">
                Hoặc
              </span>
            </div>

            {/* Nút Đăng nhập GitHub OAuth */}
            <button
              type="button"
              onClick={handleGithubOAuthLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 font-medium text-xs rounded-xl transition shadow-2xs cursor-pointer disabled:opacity-75"
            >
              <Github className="w-4 h-4 text-slate-900" />
              <span>Đăng nhập với GitHub OAuth</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Phiên bản LivingDocs Enterprise v2.0 • Đồ án Lập trình Java
          </div>
        </div>

        {/* CỘT PHẢI (5/12): Bảng chọn nhanh 5 thành viên theo phân cấp RBAC */}
        <div className="lg:col-span-5 bg-slate-50/80 border-t lg:border-t-0 lg:border-l border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5 uppercase tracking-wide">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>CHỌN TÀI KHOẢN PHÂN CẤP (QUICK SWITCH RBAC)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Bấm vào một tài khoản để tự động điền thông tin và kiểm tra luồng phân quyền:
              </p>
            </div>

            {/* Danh sách 5 tài khoản thành viên nhóm */}
            <div className="space-y-2">
              {sampleAccounts.map((account, index) => {
                const isSelected = selectedAccountId === account.id;
                const roleMeta = roleDutiesMap[account.role];
                return (
                  <div
                    key={account.id}
                    onClick={() => handleSelectAccount(account)}
                    style={{ animationDelay: `${index * 60}ms` }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 text-xs flex items-center justify-between gap-2.5 animate-fadeIn ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 shadow-sm ring-1 ring-blue-500/20 scale-[1.01] border-l-4 border-l-blue-600'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-white bg-white/80 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {/* Avatar màu sắc riêng biệt cho từng vai trò */}
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${roleMeta?.avatarColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {account.avatarLetter}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
                          <span className="font-semibold text-slate-900 text-xs truncate">
                            {account.name}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium inline-block ml-1 ${roleMeta?.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {roleMeta?.label || account.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                          {account.email}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 ml-1 shadow-xs animate-scaleIn">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dòng trạng thái xác nhận chuẩn RBAC ở góc dưới */}
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Phân quyền tự động đồng bộ theo chuẩn RBAC (Role-Based Access Control)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
