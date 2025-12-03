// import { useState, useMemo } from 'react';
// import { DashboardLayout } from '../sidebar';
// import zoomLogo from '../../assets/logos_zoom.png';
// import searchIcon from '../../assets/Vector.png';
// import { useMeetings } from '../../hooks/useMeetings';

// // Helper functions
// function formatDate(dateString?: string): string {
//   if (!dateString) return 'N/A';
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
// }

// function formatTime(dateString?: string): string {
//   if (!dateString) return 'N/A';
//   const date = new Date(dateString);
//   return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
// }

// function formatDuration(seconds?: number): string {
//   if (!seconds) return 'N/A';
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   if (hours > 0) {
//     return `${hours} H ${minutes} M`;
//   }
//   return `${minutes} M`;
// }

// function getPlatformIcon(platform?: string): string {
//   // Map platform names to icons
//   if (platform?.toLowerCase().includes('zoom')) return zoomLogo;
//   // Add more platform icons as needed
//   return zoomLogo;
// }

// export function MeetingRecordingsPage(): JSX.Element {
//   const { meetings, loading, error } = useMeetings();
//   const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');

//   // Filter meetings based on search query
//   const filteredMeetings = useMemo(() => {
//     if (!searchQuery.trim()) return meetings;
//     const query = searchQuery.toLowerCase();
//     return meetings.filter(
//       (m) =>
//         m.title?.toLowerCase().includes(query) ||
//         m.meeting_link?.toLowerCase().includes(query) ||
//         m.id?.toLowerCase().includes(query)
//     );
//   }, [meetings, searchQuery]);

//   // Get selected meeting
//   const selectedMeeting = useMemo(() => {
//     if (!selectedRecording && filteredMeetings.length > 0) {
//       return filteredMeetings[0];
//     }
//     return filteredMeetings.find((m) => m.id === selectedRecording) || filteredMeetings[0];
//   }, [filteredMeetings, selectedRecording]);

//   const handleCopyLink = (link: string): void => {
//     navigator.clipboard.writeText(link);
//   };

//   return (
//     <DashboardLayout activeTab="/meeting-recordings">
//       <div className="w-full min-h-full bg-white">
//         <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
//           {/* Breadcrumb */}
//           <nav className="mb-2 md:mb-3 lg:mb-4" aria-label="Breadcrumb">
//             <ol className="flex items-center gap-1 md:gap-2 font-nunito text-[10px] md:text-xs lg:text-sm font-semibold text-ellieGray uppercase tracking-wider">
//               <li>
//                 <a href="/dashboard" className="hover:text-ellieBlack transition-colors">
//                   DASHBOARD
//                 </a>
//               </li>
//               <li className="text-ellieGray">›</li>
//               <li className="text-ellieBlue">MEETING RECORDINGS</li>
//             </ol>
//           </nav>

//           {/* Page Title */}
//           <h1 className="font-nunito text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#1F2A44] mb-4 md:mb-6 lg:mb-8">
//             Meeting Recordings
//           </h1>

//           {/* Two Panel Layout */}
//           <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
//             {/* Left Panel: All Recordings List */}
//             <div className="flex-1 w-full lg:max-w-[65%] xl:max-w-[60%]">
//               <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8">
//                 {/* Subtitle and Search Bar in Same Row */}
//                 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4 mb-4 md:mb-6">
//                   <h2 className="font-nunito text-lg md:text-xl lg:text-2xl font-bold text-[#25324B]">
//                     All Recordings
//                   </h2>
//                   {/* Search Bar */}
//                   <div className="relative flex-shrink-0 w-full lg:w-auto">
//                     <input
//                       type="text"
//                       placeholder="Search by meeting id/link"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       className="w-full lg:min-w-[200px] xl:min-w-[250px] pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 lg:py-3 rounded-lg border border-[#7964A0] bg-white text-ellieBlack placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-xs md:text-sm lg:text-base"
//                     />
//                     <img
//                       src={searchIcon}
//                       alt="Search"
//                       className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 object-contain"
//                     />
//                   </div>
//                 </div>

//                 {/* Loading State */}
//                 {loading && (
//                   <div className="text-center py-8">
//                     <p className="font-nunito text-base text-ellieGray">Loading meetings...</p>
//                   </div>
//                 )}

//                 {/* Error State */}
//                 {error && (
//                   <div className="text-center py-8">
//                     <p className="font-nunito text-base text-red-500">Error: {error}</p>
//                     <p className="font-nunito text-sm text-ellieGray mt-2">Make sure the backend server is running</p>
//                   </div>
//                 )}

//                 {/* Mobile: Recordings Cards */}
//                 {!loading && !error && filteredMeetings.length === 0 && (
//                   <div className="text-center py-8">
//                     <p className="font-nunito text-base text-ellieGray">No meetings found</p>
//                   </div>
//                 )}

//                 {!loading && !error && (
//                   <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
//                     {filteredMeetings.map((recording) => (
//                       <div
//                         key={recording.id}
//                         onClick={() => setSelectedRecording(recording.id || null)}
//                         className={`
//                           bg-white p-4 md:p-6 cursor-pointer transition-all
//                           ${selectedRecording === recording.id ? 'bg-blue-50' : ''}
//                         `}
//                       >
//                         {/* Details with Actions */}
//                         <div className="mb-3 md:mb-4">
//                           <div className="flex items-center justify-between mb-1">
//                             <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider">
//                               Details
//                             </label>
//                             <div className="flex items-center gap-1 flex-shrink-0">
//                               <button
//                                 type="button"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   window.location.href = `/meeting-view?id=${recording.id}`;
//                                 }}
//                                 className="p-1.5 md:p-2 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
//                                 aria-label="View"
//                               >
//                                 <svg
//                                   className="w-4 h-4 md:w-5 md:h-5 text-blue-500"
//                                   fill="none"
//                                   stroke="currentColor"
//                                   viewBox="0 0 24 24"
//                                 >
//                                   <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                                   />
//                                   <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                                   />
//                                 </svg>
//                               </button>
//                             </div>
//                           </div>
//                           <div className="flex-1">
//                             <p className="font-nunito text-xs md:text-sm font-bold text-[#25324B] mb-1">
//                               {recording.title || 'Untitled Meeting'}
//                             </p>
//                             <div className="flex items-center gap-1.5">
//                               <a
//                                 href={recording.meeting_link || '#'}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 onClick={(e) => e.stopPropagation()}
//                                 className="font-nunito text-xs md:text-sm font-semibold text-[#0B5CFF] hover:underline flex-1 truncate"
//                                 title={recording.meeting_link}
//                               >
//                                 {recording.meeting_link && recording.meeting_link.length > 20
//                                   ? `${recording.meeting_link.substring(0, 20)}...`
//                                   : recording.meeting_link || 'No link'}
//                               </a>
//                               {recording.meeting_link && (
//                                 <button
//                                   type="button"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleCopyLink(recording.meeting_link!);
//                                   }}
//                                   className="flex-shrink-0 p-0.5 md:p-1 hover:bg-gray-100 rounded transition-colors"
//                                   aria-label="Copy link"
//                                 >
//                                   <svg
//                                     className="w-3 h-3 md:w-4 md:h-4 text-ellieGray"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     viewBox="0 0 24 24"
//                                   >
//                                     <path
//                                       strokeLinecap="round"
//                                       strokeLinejoin="round"
//                                       strokeWidth={2}
//                                       d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
//                                     />
//                                   </svg>
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Date/Time and Platform in One Row */}
//                         <div className="pb-3 md:pb-4 border-b border-[#DEE1E6]">
//                           <div className="flex items-center justify-between">
//                             <div>
//                               <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider mb-1 block">
//                                 Date/Time
//                               </label>
//                               <div className="flex flex-col gap-1">
//                                 <span className="font-nunito text-xs md:text-sm font-bold text-[#25324B]">
//                                   {formatDate(recording.started_at)}
//                                 </span>
//                                 <span className="font-nunito text-xs md:text-sm font-bold text-[#25324B]">
//                                   {formatTime(recording.started_at)}
//                                 </span>
//                               </div>
//                             </div>
//                             <div className="flex flex-col items-end">
//                               <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider mb-1 block">
//                                 Platform
//                               </label>
//                               <img
//                                 src={getPlatformIcon(recording.platform)}
//                                 alt={recording.platform || 'platform'}
//                                 className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 object-contain flex-shrink-0"
//                               />
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* Desktop: Recordings Table */}
//                 {!loading && !error && (
//                   <div className="hidden lg:block overflow-x-auto">
//                     <table className="w-full">
//                       <thead>
//                         <tr className="border-b border-[#DEE1E6]">
//                           <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] max-w-[300px]">
//                             Details
//                           </th>
//                           <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
//                             Date/Time
//                           </th>
//                           <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
//                             Platform
//                           </th>
//                           <th className="text-center py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
//                             Actions
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {filteredMeetings.map((recording) => (
//                           <tr
//                             key={recording.id}
//                             onClick={() => setSelectedRecording(recording.id || null)}
//                             className={`
//                               border-b border-[#DEE1E6] cursor-pointer transition-colors
//                               ${selectedRecording === recording.id ? 'bg-[rgba(50,122,173,0.1)]' : 'hover:bg-gray-50'}
//                             `}
//                           >
//                             <td className="py-4 px-4 max-w-[300px]">
//                               <div className="flex flex-col gap-1">
//                                 <p className="font-nunito text-base font-bold text-[#25324B]">
//                                   {recording.title || 'Untitled Meeting'}
//                                 </p>
//                                 <div className="flex items-center gap-2">
//                                   <a
//                                     href={recording.meeting_link || '#'}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     onClick={(e) => e.stopPropagation()}
//                                     className="font-nunito text-base font-semibold text-[#0B5CFF] hover:underline truncate"
//                                     title={recording.meeting_link}
//                                   >
//                                     {recording.meeting_link && recording.meeting_link.length > 18
//                                       ? `${recording.meeting_link.substring(0, 18)}...`
//                                       : recording.meeting_link || 'No link'}
//                                   </a>
//                                   {recording.meeting_link && (
//                                     <button
//                                       type="button"
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         handleCopyLink(recording.meeting_link!);
//                                       }}
//                                       className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
//                                       aria-label="Copy link"
//                                     >
//                                       <svg
//                                         className="w-4 h-4 text-ellieGray"
//                                         fill="none"
//                                         stroke="currentColor"
//                                         viewBox="0 0 24 24"
//                                       >
//                                         <path
//                                           strokeLinecap="round"
//                                           strokeLinejoin="round"
//                                           strokeWidth={2}
//                                           d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
//                                         />
//                                       </svg>
//                                     </button>
//                                   )}
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="py-4 px-4 whitespace-nowrap">
//                               <div className="flex flex-col gap-1">
//                                 <span className="font-nunito text-base font-bold text-[#25324B]">
//                                   {formatDate(recording.started_at)}
//                                 </span>
//                                 <span className="font-nunito text-base font-bold text-[#25324B]">
//                                   {formatTime(recording.started_at)}
//                                 </span>
//                               </div>
//                             </td>
//                             <td className="py-4 px-4 whitespace-nowrap">
//                               <div className="flex items-center">
//                                 <img
//                                   src={getPlatformIcon(recording.platform)}
//                                   alt={recording.platform || 'platform'}
//                                   className="w-10 h-10 object-contain flex-shrink-0"
//                                 />
//                               </div>
//                             </td>
//                             <td className="py-4 px-4 whitespace-nowrap">
//                               <div className="flex items-center justify-center gap-1">
//                                 <button
//                                   type="button"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     window.location.href = `/meeting-view?id=${recording.id}`;
//                                   }}
//                                   className="p-2 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
//                                   aria-label="View"
//                                 >
//                                   <svg
//                                     className="w-5 h-5 text-blue-500"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     viewBox="0 0 24 24"
//                                   >
//                                     <path
//                                       strokeLinecap="round"
//                                       strokeLinejoin="round"
//                                       strokeWidth={2}
//                                       d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                                     />
//                                     <path
//                                       strokeLinecap="round"
//                                       strokeLinejoin="round"
//                                       strokeWidth={2}
//                                       d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                                     />
//                                   </svg>
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Right Panel: Video Player and Meeting Details */}
//             <div className="flex-1 w-full lg:max-w-[35%] xl:max-w-[40%]">
//               <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8">
//                 {/* Video Player */}
//                 <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#101828] border border-[#E2E8F3] shadow-[0_18px_36px_rgba(16,24,40,0.28)]">
//                   {/* Video Grid with Participants */}
//                   <div className="absolute inset-0 grid grid-cols-3 gap-1 p-2">
//                     {[
//                       'Danielle Mendoza',
//                       'Kristin Watson',
//                       'Mady Warren',
//                       'Cameron Williamson',
//                       'Ralph Edwards',
//                       'Jenna Davis',
//                       'Floyd Miles',
//                       'Jerome Bell',
//                       'Savannah Nguyen',
//                     ].map((name, i) => (
//                       <div
//                         key={i}
//                         className="bg-gray-800 rounded flex flex-col items-center justify-center text-white text-[10px] md:text-xs font-nunito relative overflow-hidden"
//                       >
//                         <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900"></div>
//                         <span className="relative z-10 px-1 text-center truncate w-full">{name}</span>
//                       </div>
//                     ))}
//                   </div>
//                   {/* Play Button */}
//                   <button
//                     type="button"
//                     className="absolute left-1/2 top-1/2 flex h-14 w-14 md:h-16 md:w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F04438] text-white shadow-[0_18px_38px_rgba(240,68,56,0.35)] transition hover:scale-105 z-10"
//                     aria-label="Play meeting recording"
//                   >
//                     <svg
//                       aria-hidden
//                       className="ml-1 h-6 w-6 md:h-7 md:w-7"
//                       fill="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path d="M8 5v14l11-7z" />
//                     </svg>
//                   </button>
//                   {/* Video Controls Bar */}
//                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-2 md:p-3">
//                     <div className="flex items-center justify-between text-white text-[10px] md:text-xs font-nunito">
//                       <span className="font-semibold">QA Planning</span>
//                       <div className="flex items-center gap-1 md:gap-2">
//                         <button className="p-1 md:p-1.5 hover:bg-white/20 rounded transition-colors" aria-label="Microphone">
//                           <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
//                             <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
//                             <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
//                           </svg>
//                         </button>
//                         <button className="p-1 md:p-1.5 hover:bg-white/20 rounded transition-colors" aria-label="Camera">
//                           <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
//                             <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
//                           </svg>
//                         </button>
//                         <button className="p-1 md:p-1.5 hover:bg-white/20 rounded transition-colors" aria-label="Share">
//                           <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
//                             <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
//                           </svg>
//                         </button>
//                         <button className="p-1 md:p-1.5 hover:bg-white/20 rounded transition-colors" aria-label="Chat">
//                           <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
//                             <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
//                           </svg>
//                         </button>
//                         <button className="p-1 md:p-1.5 hover:bg-white/20 rounded transition-colors text-red-400" aria-label="Leave">
//                           <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
//                             <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
//                           </svg>
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Meeting Details */}
//                 <div className="space-y-4 md:space-y-5">
//                   <h2 className="font-nunito text-lg md:text-xl lg:text-2xl font-bold text-[#25324B] pb-3 md:pb-4 border-b border-[#DEE1E6]">
//                     Meeting Details
//                   </h2>
                  
//                   <div className="space-y-4 md:space-y-5">
//                     {selectedMeeting ? (
//                       <>
//                         {/* Meeting Title */}
//                         <div>
//                           <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
//                             Meeting title
//                           </label>
//                           <p className="font-nunito text-sm md:text-base lg:text-lg font-bold text-[#25324B]">
//                             {selectedMeeting.title || 'Untitled Meeting'}
//                           </p>
//                         </div>

//                         {/* Meeting Recording Link */}
//                         {selectedMeeting.meeting_link && (
//                           <div>
//                             <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
//                               Meeting Recording Link (Sharable)
//                             </label>
//                             <div className="flex items-center gap-2">
//                               <a
//                                 href={selectedMeeting.meeting_link}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="font-nunito text-sm md:text-base font-semibold text-[#0B5CFF] hover:underline flex-1 truncate"
//                                 title={selectedMeeting.meeting_link}
//                               >
//                                 {selectedMeeting.meeting_link.length > 40
//                                   ? `${selectedMeeting.meeting_link.substring(0, 40)}...`
//                                   : selectedMeeting.meeting_link}
//                               </a>
//                               <button
//                                 type="button"
//                                 onClick={() => handleCopyLink(selectedMeeting.meeting_link!)}
//                                 className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
//                                 aria-label="Copy link"
//                               >
//                                 <svg
//                                   className="w-4 h-4 text-ellieGray"
//                                   fill="none"
//                                   stroke="currentColor"
//                                   viewBox="0 0 24 24"
//                                 >
//                                   <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
//                                   />
//                                 </svg>
//                               </button>
//                             </div>
//                           </div>
//                         )}

//                         {/* Meeting Date and Total Duration in One Row */}
//                         <div className="flex flex-row items-start justify-between gap-4 sm:gap-6">
//                           {/* Meeting Date */}
//                           <div className="flex-1">
//                             <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
//                               Meeting Date
//                             </label>
//                             <p className="font-nunito text-sm md:text-base lg:text-lg font-bold text-[#25324B]">
//                               {formatDate(selectedMeeting.started_at)} | {formatTime(selectedMeeting.started_at)}
//                             </p>
//                           </div>

//                           {/* Total Duration */}
//                           <div className="flex-1">
//                             <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
//                               Total Duration
//                             </label>
//                             <p className="font-nunito text-sm md:text-base lg:text-lg font-bold text-[#25324B]">
//                               {formatDuration(selectedMeeting.duration_seconds)}
//                             </p>
//                           </div>
//                         </div>

//                         {/* Total Participants and Platform in One Row */}
//                         <div className="flex flex-row items-start justify-between gap-4 sm:gap-6">
//                           {/* Total Participants */}
//                           <div className="flex-1">
//                             <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
//                               Total Participants
//                             </label>
//                             <p className="font-nunito text-sm md:text-base lg:text-lg font-bold text-[#25324B]">
//                               {selectedMeeting.participant_count || 0}
//                             </p>
//                           </div>

//                           {/* Platform */}
//                           <div className="flex-1">
//                             <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
//                               Platform
//                             </label>
//                             <div className="flex items-center">
//                               <img
//                                 src={getPlatformIcon(selectedMeeting.platform)}
//                                 alt={selectedMeeting.platform || 'platform'}
//                                 className="w-8 h-8 md:w-10 md:h-10 object-contain flex-shrink-0"
//                               />
//                             </div>
//                           </div>
//                         </div>
//                       </>
//                     ) : (
//                       <div className="text-center py-8">
//                         <p className="font-nunito text-base text-ellieGray">Select a meeting to view details</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }

// -------------------------------------------------------------------------------------------------
import { DashboardLayout } from '../sidebar';

export function MeetingRecordingsPage(): JSX.Element {
  /* 
   * ORIGINAL STATE AND HOOKS - COMMENTED OUT
   * These handle data fetching and filtering for meeting recordings
   */
  // const { meetings, loading, error } = useMeetings();
  // const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
  // const [searchQuery, setSearchQuery] = useState('');

  /* 
   * Filtering meetings by search query - COMMENTED OUT 
   */
  // const filteredMeetings = useMemo(() => {
  //   if (!searchQuery.trim()) return meetings;
  //   const query = searchQuery.toLowerCase();
  //   return meetings.filter(
  //     (m) =>
  //       m.title?.toLowerCase().includes(query) ||
  //       m.meeting_link?.toLowerCase().includes(query) ||
  //       m.id?.toLowerCase().includes(query)
  //   );
  // }, [meetings, searchQuery]);

  /* 
   * Selected meeting retrieval - COMMENTED OUT
   */
  // const selectedMeeting = useMemo(() => {
  //   if (!selectedRecording && filteredMeetings.length > 0) {
  //     return filteredMeetings[0];
  //   }
  //   return filteredMeetings.find((m) => m.id === selectedRecording) || filteredMeetings[0];
  // }, [filteredMeetings, selectedRecording]);

  /* 
   * Clipboard utility - COMMENTED OUT
   */
  // const handleCopyLink = (link: string): void => {
  //   navigator.clipboard.writeText(link);
  // };

  return (
    <DashboardLayout activeTab="/meeting-recordings">
      <div className="w-full min-h-full bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">

          {/* 
            BREADCRUMB - COMMENTED OUT to hide original navigation
          */}
          {/* 
          <nav className="mb-2 md:mb-3 lg:mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 md:gap-2 font-nunito text-[10px] md:text-xs lg:text-sm font-semibold text-ellieGray uppercase tracking-wider">
              <li>
                <a href="/dashboard" className="hover:text-ellieBlack transition-colors">
                  DASHBOARD
                </a>
              </li>
              <li className="text-ellieGray">›</li>
              <li className="text-ellieBlue">MEETING RECORDINGS</li>
            </ol>
          </nav>
          */}

          {/* 
            PAGE TITLE - COMMENTED OUT to hide original title
          */}
          {/* 
          <h1 className="font-nunito text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#1F2A44] mb-4 md:mb-6 lg:mb-8">
            Meeting Recordings
          </h1>
          */}

          {/* 
            ORIGINAL TWO-PANEL LAYOUT - COMMENTED OUT ENTIRELY
            Left panel with recordings list
            Right panel with video player and meeting details
          */}
          {/* 
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="flex-1 w-full lg:max-w-[65%] xl:max-w-[60%]">
              ...recordings list and table content here...
            </div>
            <div className="flex-1 w-full lg:max-w-[35%] xl:max-w-[40%]">
              ...video player and meeting details content here...
            </div>
          </div>
          */}

          {/* 
            NEW COMING SOON MESSAGE - replaces all original sections
            Styled with your brand colors and fonts
          */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
            <div className="max-w-md mx-auto text-center">
              {/* Icon with gradient background */}
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-ellieBlue to-elliePurple rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              {/* Title */}
              <h1 className="font-nunito text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1F2A44] mb-6 leading-tight">
                Meeting Recordings
              </h1>
              {/* Primary message */}
              <p className="font-nunito text-xl md:text-2xl text-ellieGray mb-8 leading-relaxed">
                It will be updated soon
              </p>
              {/* Supporting text */}
              <p className="font-nunito text-base md:text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                We're working on bringing you powerful meeting recording features. Stay tuned for updates!
              </p>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
