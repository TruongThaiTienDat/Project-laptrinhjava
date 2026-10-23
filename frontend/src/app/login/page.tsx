'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLivingDocs, sampleAccounts, UserRole, AuthUser } from '@/context/LivingDocsContext';
import { LogIn, Github, Shield, Check, Lock, Mail, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useLivingDocs();

  // Mặc định chọn tài khoản Staff Reviewer
  const [selectedAccountId, setSelectedAccountId] = useState<string>('user-staff');
  const [email, setEmail] = useState<string>('staff@livingdocs.vn');
  const [password, setPassword] = useState<string>('12345678');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Staff');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Khi bấm chọn một tài khoản mẫu
  const handleSelectAccount = (account: AuthUser) => {
    setSelectedAccountId(account.id);
    setEmail(account.email);
    setPassword('12345678');
    setSelectedRole(account.role);
    setErrorMsg('');
  };

  // Xử lý đăng nhập thông thường
  const handleFormLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập email hoặc tên đăng nhập.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    // Tìm tài khoản khớp trong danh sách mẫu, nếu không có thì tạo tài khoản kiểm thử theo dữ liệu nhập
    const matched = sampleAccounts.find(
      acc => acc.email.toLowerCase() === email.trim().toLowerCase()
    );

    const userToLogin: AuthUser = matched || {
      id: `user-${Date.now()}`,
      name: email.includes('@') ? email.split('@')[0] : email,
      email: email.includes('@') ? email : `${email}@livingdocs.vn`,
      role: selectedRole,
      avatarLetter: (email[0] || 'U').toUpperCase(),
      roleDescription: `Vai trò ${selectedRole}`
    };

    setTimeout(() => {
      login(userToLogin);
      router.push('/');
    }, 250);
  };

  // Đăng nhập với GitHub OAuth
  const handleGithubOAuthLogin = () => {
    setIsLoading(true);
    setErrorMsg('');

    // Tìm tài khoản tương ứng với vai trò đang chọn hoặc dùng Developer
    const matched = sampleAccounts.find(acc => acc.role === selectedRole) || sampleAccounts[0];
    const oauthUser: AuthUser = {
      ...matched,
      name: `${matched.name} (GitHub)`,
      email: `github.${matched.email}`
    };

    setTimeout(() => {
      login(oauthUser);
      router.push('/');
    }, 300);
  };

  return (
    <div className="w-full max-w-lg mx-auto py-8">
      {/* Khung đăng nhập chính */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Tiêu đề & Logo */}
        <div className="text-center space-y-1.5 pb-2 border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 mb-2 border border-blue-200">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            LivingDocs
          </h1>
          <p className="text-xs text-slate-500">
            Hệ thống quản lý và tự động hóa tài liệu kỹ thuật
          </p>
          <div className="pt-2">
            <h2 className="text-base font-semibold text-slate-800">
              Đăng nhập hệ thống
            </h2>
          </div>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMsg && (
          <div className="p-3 text-xs rounded bg-rose-50 border border-rose-200 text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* Form đăng nhập */}
        <form onSubmit={handleFormLogin} className="space-y-4">
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
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu tài khoản"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vai trò truy cập (RBAC)
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
            >
              <option value="Developer">Developer - Lập trình viên (Tạo & gửi duyệt)</option>
              <option value="Staff">Staff Reviewer - Chuyên viên xét duyệt (Duyệt bước 1)</option>
              <option value="Manager">Manager Approver - Quản lý phê duyệt (Phê duyệt & xuất bản)</option>
              <option value="Technical Lead">Technical Lead - Trưởng nhóm kỹ thuật</option>
              <option value="Administrator">Administrator - Quản trị viên hệ thống</option>
            </select>
          </div>

          {/* Nút Đăng nhập chính */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium text-xs rounded transition shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}</span>
          </button>
        </form>

        {/* Ngăn cách Hoặc */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider absolute">
            Hoặc đăng nhập với
          </span>
        </div>

        {/* Nút Đăng nhập GitHub OAuth */}
        <button
          type="button"
          onClick={handleGithubOAuthLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs rounded transition shadow-sm"
        >
          <Github className="w-4 h-4 text-slate-900" />
          <span>Đăng nhập với GitHub OAuth</span>
        </button>

        {/* Danh sách chọn nhanh tài khoản kiểm thử */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Chọn nhanh tài khoản theo phân cấp (Phục vụ kiểm thử)</span>
            </h3>
          </div>
          <p className="text-[11px] text-slate-500">
            Bấm vào bất kỳ tài khoản bên dưới để tự động điền và sẵn sàng kiểm thử:
          </p>

          <div className="space-y-2">
            {sampleAccounts.map((account) => {
              const isSelected = selectedAccountId === account.id;
              return (
                <div
                  key={account.id}
                  onClick={() => handleSelectAccount(account)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition text-xs flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                      {account.avatarLetter}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 truncate">
                          {account.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${
                          account.role === 'Developer'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : account.role === 'Staff'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : account.role === 'Manager'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : account.role === 'Technical Lead'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {account.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {account.email} • {account.roleDescription}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 ml-2">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Thông tin chân trang */}
        <div className="text-center text-[11px] text-slate-400 pt-1">
          Phiên bản LivingDocs v1.0 • Đồ án Lập trình Java
        </div>
      </div>
    </div>
  );
}
