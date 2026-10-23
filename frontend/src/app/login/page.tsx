'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLivingDocs, sampleAccounts, UserRole, AuthUser } from '@/context/LivingDocsContext';
import { LogIn, Github, Shield, Check, Lock, Mail, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useLivingDocs();

  // Mặc định chọn tài khoản Staff Reviewer (Nguyễn Thành Đồng)
  const [selectedAccountId, setSelectedAccountId] = useState<string>('user-staff');
  const [email, setEmail] = useState<string>('dong.nguyen@livingdocs.vn');
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
      roleDescription: selectedRole
    };

    setTimeout(() => {
      login(userToLogin);
      router.replace('/');
    }, 200);
  };

  // Đăng nhập với GitHub OAuth
  const handleGithubOAuthLogin = () => {
    setIsLoading(true);
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
    }, 250);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Khung Card chính chia 2 cột cân đối */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Cột trái (7/12): Form Đăng nhập hệ thống */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Header thương hiệu */}
            <div className="space-y-1.5 pb-3 border-b border-slate-100">
              <div className="inline-flex items-center space-x-2 text-blue-600 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-bold text-lg text-slate-900 tracking-tight">LivingDocs</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Đăng nhập hệ thống
              </h1>
              <p className="text-xs text-slate-500">
                Hệ thống quản lý và tự động hóa tài liệu kỹ thuật LivingDocs
              </p>
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
                    placeholder="Nhập mật khẩu"
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
                  onChange={(e) => {
                    const newRole = e.target.value as UserRole;
                    setSelectedRole(newRole);
                    const matched = sampleAccounts.find(acc => acc.role === newRole);
                    if (matched) {
                      setSelectedAccountId(matched.id);
                      setEmail(matched.email);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition font-medium cursor-pointer"
                >
                  <option value="Developer">Developer</option>
                  <option value="Staff">Staff Reviewer</option>
                  <option value="Manager">Manager Approver</option>
                  <option value="Technical Lead">Technical Lead</option>
                  <option value="Administrator">Administrator</option>
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
                Hoặc
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
          </div>

          <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Phiên bản LivingDocs v1.0 • Đồ án Lập trình Java
          </div>
        </div>

        {/* Cột phải (5/12): Danh sách tài khoản mẫu phân quyền RBAC */}
        <div className="lg:col-span-5 bg-slate-50/70 border-t lg:border-t-0 lg:border-l border-slate-200 p-6 sm:p-7 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5 uppercase tracking-wide">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Tài khoản mẫu kiểm thử (RBAC)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Bấm vào một tài khoản bên dưới để tự động điền thông tin và kiểm tra luồng phân quyền:
              </p>
            </div>

            {/* Danh sách 5 tài khoản mẫu */}
            <div className="space-y-2.5">
              {sampleAccounts.map((account) => {
                const isSelected = selectedAccountId === account.id;
                return (
                  <div
                    key={account.id}
                    onClick={() => handleSelectAccount(account)}
                    className={`p-3 rounded-lg border cursor-pointer transition text-xs flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'border-blue-500 bg-white ring-1 ring-blue-500 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                        {account.avatarLetter}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
                          <span className="font-semibold text-slate-900 text-xs truncate">
                            {account.name}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium inline-block ml-1 ${
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
                            {account.role === 'Staff' ? 'Staff Reviewer' : account.role === 'Manager' ? 'Manager Approver' : account.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                          {account.email}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 ml-1 shadow-2xs">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-2.5 rounded bg-blue-50/60 border border-blue-100 text-[11px] text-blue-800">
            <strong>Gợi ý:</strong> Sau khi đăng nhập, bạn cũng có thể đổi nhanh quyền trực tiếp ở menu góc phải trên thanh Topbar.
          </div>
        </div>
      </div>
    </div>
  );
}
