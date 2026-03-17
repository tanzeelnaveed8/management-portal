'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiUsers, FiBriefcase, FiCheckSquare, FiSettings, FiUser, FiLogOut } from 'react-icons/fi';
import {
     LayoutDashboard,
     Briefcase,
     FileText,
     User,
     ListTodo,
     ChevronRight,
     Settings,
     HelpCircle,
     Bell
} from 'lucide-react';
import { useProfile } from '../../../hooks/useProfile';
import Image from 'next/image';
import { useState } from 'react';
import Logo from '../../../public/icon.png';

export default function Sidebar({ userRole = '' }) {
     const pathname = usePathname();
     const { user, isLoading } = useProfile();
     const [isCollapsed, setIsCollapsed] = useState(false);
     console.log("User Name:", user?.name || "Guest");

     const menuItems = {
          CEO: [
               { name: 'Dashboard', icon: FiHome, path: '/ceo' },
               { name: 'Projects', icon: FiBriefcase, path: '/ceo/projects' },
               { name: 'Managers', icon: FiUsers, path: '/ceo/managers' },
               { name: 'Reports', icon: FiCheckSquare, path: '/ceo/reports' },
               { name: 'Settings', icon: FiSettings, path: '/ceo/settings' },
               { name: 'Profile', icon: FiUser, path: '/ceo/profile' }
          ],
          PROJECT_MANAGER: [
               { name: 'Dashboard', icon: FiHome, path: '/project-manager' },
               { name: 'My Projects', icon: FiBriefcase, path: '/project-manager/projects' },
               { name: 'Clients', icon: FiUsers, path: '/project-manager/clients' },
               { name: 'Reports', icon: FiCheckSquare, path: '/project-manager/reports' },
               { name: 'Profile', icon: FiUser, path: '/project-manager/profile' }
          ],
          TEAM_LEAD: [
               { name: 'Dashboard', icon: FiHome, path: '/team-lead' },
               { name: 'Projects', icon: FiBriefcase, path: '/team-lead/projects' },
               { name: 'Tasks Control', icon: FiCheckSquare, path: '/team-lead/tasks' },
               { name: 'My Developers', icon: FiUsers, path: '/team-lead/my-developers' },
               { name: 'Approvals', icon: FiCheckSquare, path: '/team-lead/approvals' },
               { name: 'Report Issues', icon: FiUsers, path: '/team-lead/report-issues' },
               { name: 'Profile', icon: FiUser, path: '/team-lead/profile' }
          ],
          DEVELOPER: [
               { name: 'Dashboard', icon: FiHome, path: '/developer' },
               { name: 'My Tasks', icon: FiCheckSquare, path: '/developer/tasks' },
               { name: 'Projects', icon: FiBriefcase, path: '/developer/projects' },
               { name: 'Profile', icon: FiUser, path: '/developer/profile' }
          ]
     };

     const roleMenuItems = menuItems[userRole] || [];

     // Role-based home path so logo keeps user in their dashboard
     const homePath = roleMenuItems.length > 0 ? roleMenuItems[0].path : '/';

     const NavItem = ({ item }) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
               <Link
                    href={item.path}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
          ${isActive
                              ? 'bg-gradient-to-r from-accent to-accent-hover text-white shadow-lg shadow-accent/25'
                              : 'text-gray-400 hover:bg-bg-subtle hover:text-accent'
                         }`}
               >
                    {/* Active indicator */}
                    {isActive && (
                         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                    )}

                    <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="text-sm font-medium">{item.name}</span>

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                         <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                              {item.name}
                         </div>
                    )}
               </Link>
          );
     };

     const getUserRoleDisplay = () => {
          const roleMap = {
               CEO: 'Chief Executive Officer',
               PROJECT_MANAGER: 'Project Manager',
               TEAM_LEAD: 'Team Lead',
               DEVELOPER: 'Developer'
          };
          return roleMap[userRole] || userRole;
     };

     // Get user initials for avatar
     const getUserInitials = () => {
          if (!user?.name) return 'U';
          return user.name
               .split(' ')
               .map(n => n[0])
               .join('')
               .toUpperCase()
               .substring(0, 2);
     };

     return (
          <>
               {/* Desktop Sidebar */}
               <aside
                    className={`hidden md:flex md:flex-col bg-gradient-to-b from-bg-surface to-bg-card border-r border-border-default h-screen sticky top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'
                         }`}
               >
                    {/* Logo Section with Collapse Toggle */}
                    <div className={`flex items-center justify-between p-6 border-b border-border-default ${isCollapsed ? 'px-4' : ''}`}>
                         <Link href={homePath} className="flex items-center gap-3">
                              <div className="relative w-10 h-10">
                                   <Image
                                        src={Logo}
                                        alt="ProManage Logo"
                                        width={40}
                                        height={40}
                                        className="rounded-xl"
                                        priority
                                   />
                              </div>
                              {!isCollapsed && (
                                   <span className="text-xl font-bold bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                                       Meetech
                                   </span>
                              )}
                         </Link>

                         <button
                              onClick={() => setIsCollapsed(!isCollapsed)}
                              className="p-2 hover:bg-bg-subtle rounded-lg transition-colors text-gray-400 hover:text-accent"
                         >
                              <ChevronRight size={18} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                         </button>
                    </div>

                    {/* User Profile Quick Info */}
                    <div className={`p-4 border-b border-border-default ${isCollapsed ? 'text-center' : ''}`}>
                         <div className={`flex items-center gap-3 ${isCollapsed ? 'flex-col' : ''}`}>
                              <div className="relative">
                                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        {getUserInitials()}
                                   </div>
                                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-bg-surface"></div>
                              </div>

                              {!isCollapsed && (
                                   <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-text-primary truncate">{user?.name || 'Loading...'}</p>
                                        <p className="text-xs text-text-muted truncate">{getUserRoleDisplay()}</p>
                                   </div>
                              )}
                         </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 chat-scroll overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-border-default">
                         {roleMenuItems.map((item, index) => (
                              <NavItem key={index} item={item} />
                         ))}
                    </nav>

                   
               </aside>

               {/* Mobile Bottom Navigation */}
               <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border-default z-50 px-2 py-2">
                    <div className="flex justify-around items-center">
                         {roleMenuItems.slice(0, 5).map((item, index) => {
                              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                              const Icon = item.icon;

                              return (
                                   <Link
                                        key={index}
                                        href={item.path}
                                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? 'text-accent' : 'text-gray-400'
                                             }`}
                                   >
                                        <Icon size={20} />
                                        <span className="text-[10px] mt-1">{item.name}</span>
                                   </Link>
                              );
                         })}
                    </div>
               </nav>
          </>
     );
}