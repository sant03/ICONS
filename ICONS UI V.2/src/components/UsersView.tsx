import React, { useState } from 'react';
import { UserProfile, AuditLog, ViewMode } from '../types';
import { 
  User, 
  ArrowLeft, 
  Edit, 
  Lock, 
  UserX, 
  Power, 
  ShieldCheck, 
  History, 
  Trash2, 
  Eye, 
  Camera, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  Mail, 
  Briefcase 
} from 'lucide-react';

interface UsersViewProps {
  user: UserProfile;
  auditLogs: AuditLog[];
  onNavigate: (view: ViewMode) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ user, auditLogs, onNavigate }) => {
  const [profile, setProfile] = useState<UserProfile>(user);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-200 pb-20">
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-6 space-y-1">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-semibold text-cyan-500 hover:underline flex items-center gap-1 mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO USERS</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Users / {profile.fullName}
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-mono">
              Member since: {profile.memberSince}
            </p>
          </div>

          <button
            onClick={() => alert("Editing mode enabled.")}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span>Edit User Info</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Avatar & Security Card + User Details Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Avatar Card & Security Config */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm text-center space-y-4">
            {/* Avatar Photo Container */}
            <div className="relative w-36 h-36 mx-auto rounded-3xl overflow-hidden ring-4 ring-cyan-500/20 group">
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
              <button className="absolute bottom-2 right-2 p-2 rounded-xl bg-cyan-500 text-white shadow-md hover:scale-105 transition-transform cursor-pointer">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold tracking-wider uppercase border border-emerald-500/20">
                ACTIVE SESSION
              </span>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{profile.username}</h3>
              <p className="text-xs font-mono text-[var(--text-muted)]">ID: {profile.idNumber}</p>
            </div>

            {/* Advanced User Configuration */}
            <div className="pt-4 border-t border-[var(--border-color)] space-y-2 text-left">
              <p className="text-[10px] font-mono font-bold uppercase text-rose-500 tracking-wider">
                ADVANCED USER CONFIGURATION
              </p>

              <button
                onClick={() => setProfile({ ...profile, status: profile.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED' })}
                className="w-full py-2 px-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-amber-500/10 text-amber-500 border border-[var(--border-color)] hover:border-amber-500/30 text-xs font-mono font-bold uppercase flex items-center gap-2 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{profile.status === 'LOCKED' ? 'UNLOCK USER' : 'LOCK USER'}</span>
              </button>

              <button
                onClick={() => alert("Account disabled")}
                className="w-full py-2 px-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-rose-500/10 text-rose-500 border border-[var(--border-color)] hover:border-rose-500/30 text-xs font-mono font-bold uppercase flex items-center gap-2 transition-all cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>DISABLE ACCOUNT</span>
              </button>

              <button
                onClick={() => alert("Access suspended")}
                className="w-full py-2 px-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-rose-500/10 text-rose-400 border border-[var(--border-color)] hover:border-rose-500/30 text-xs font-mono font-bold uppercase flex items-center gap-2 transition-all cursor-pointer"
              >
                <Power className="w-3.5 h-3.5" />
                <span>SUSPEND ACCESS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: User Details Form */}
        <div className="lg:col-span-8">
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6">
            <div className="border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">User Details</h3>
              <p className="text-xs text-[var(--text-muted)]">Personal and professional identification data</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                    <User className="w-3 h-3 text-cyan-500" />
                    <span>USERNAME</span>
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                    <User className="w-3 h-3 text-cyan-500" />
                    <span>FULL NAME</span>
                  </label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 col-span-2 sm:col-span-2">
                  <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-cyan-500" />
                    <span>DATE OF BIRTH</span>
                  </label>
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">
                    # AGE
                  </label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                    <Phone className="w-3 h-3 text-cyan-500" />
                    <span>PHONE NUMBER</span>
                  </label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                    <Phone className="w-3 h-3 text-cyan-500" />
                    <span>LANDLINE</span>
                  </label>
                  <input
                    type="text"
                    value={profile.landline || 'Optional'}
                    onChange={(e) => setProfile({ ...profile, landline: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                  <Mail className="w-3 h-3 text-cyan-500" />
                  <span>EMAIL ADDRESS</span>
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-cyan-500" />
                    <span>ROLE</span>
                  </label>
                  <select
                    value={profile.role}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                  >
                    <option value="Administrative">Administrative</option>
                    <option value="Manager">Manager</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-cyan-500" />
                    <span>POSITION NAME</span>
                  </label>
                  <input
                    type="text"
                    value={profile.positionName}
                    onChange={(e) => setProfile({ ...profile, positionName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                  />
                </div>
              </div>

              {isSaved && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>User profile updated successfully!</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProfile(user)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  Update Information
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY / AUDIT TRAIL SECTION */}
      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-500" />
              <span>Recent Activity</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-mono">AUDIT TRAIL OF THE LAST USER OPERATIONS</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>AUDIT TRAIL LIVE</span>
            </span>

            <button
              onClick={() => alert("History cleared.")}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <th className="py-3 px-4">DATE & TIME</th>
                <th className="py-3 px-4">DESCRIPTION</th>
                <th className="py-3 px-4 text-center">CATEGORY</th>
                <th className="py-3 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-xs">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[var(--text-muted)]">{log.dateTime}</td>
                  <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">{log.description}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => alert(`Log Details: ${log.description}`)}
                      className="text-cyan-500 hover:underline font-semibold flex items-center gap-1 mx-auto cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{log.action}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-3 flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] border-t border-[var(--border-color)]">
          <span className="flex items-center gap-1 text-cyan-500">
            <ShieldCheck className="w-3.5 h-3.5" /> STATUS: SYNCHRONIZED
          </span>
          <span>SECURITY LEVEL: ENTERPRISE</span>
        </div>
      </div>
    </div>
  );
};
