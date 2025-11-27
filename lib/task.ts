// lib/utils/task.ts

/**
 * Format deadline to Indonesian locale
 */
export function formatDeadline(deadline: string | Date): string {
  const date = new Date(deadline);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Check if deadline has passed
 */
export function isDeadlinePassed(deadline: string | Date): boolean {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  return now > deadlineDate;
}

/**
 * Get time remaining until deadline
 */
export function getTimeRemaining(deadline: string | Date): {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
} {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();

  if (diff < 0) {
    return { days: 0, hours: 0, minutes: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, isPast: false };
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(deadline: string | Date): string {
  const { days, hours, minutes, isPast } = getTimeRemaining(deadline);

  if (isPast) {
    return 'Deadline telah lewat';
  }

  if (days > 0) {
    return `${days} hari ${hours} jam lagi`;
  }

  if (hours > 0) {
    return `${hours} jam ${minutes} menit lagi`;
  }

  return `${minutes} menit lagi`;
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Get file icon based on extension
 */
export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename);
  
  const iconMap: { [key: string]: string } = {
    pdf: '📄',
    doc: '📘',
    docx: '📘',
    ppt: '📊',
    pptx: '📊',
    xls: '📗',
    xlsx: '📗',
    txt: '📝',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    zip: '📦',
    rar: '📦',
  };

  return iconMap[ext] || '📎';
}

/**
 * Validate file type for upload
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const ext = getFileExtension(file.name);
  return allowedTypes.includes(ext);
}

/**
 * Download file from URL
 */
export async function downloadFile(fileUrl: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

/**
 * Get submission status badge color
 */
export function getStatusBadgeColor(status: 'submitted' | 'late'): {
  bg: string;
  text: string;
} {
  switch (status) {
    case 'submitted':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-300'
      };
    case 'late':
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-300'
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-700 dark:text-gray-300'
      };
  }
}

/**
 * Convert datetime-local input value to MySQL datetime format
 */
export function formatDateTimeForMySQL(dateTimeLocal: string): string {
  // dateTimeLocal format: "2025-11-30T14:30"
  // MySQL format: "2025-11-30 14:30:00"
  return dateTimeLocal.replace('T', ' ') + ':00';
}

/**
 * Convert MySQL datetime to datetime-local input value
 */
export function formatMySQLDateTimeForInput(mysqlDateTime: string): string {
  // MySQL format: "2025-11-30 14:30:00"
  // datetime-local format: "2025-11-30T14:30"
  return mysqlDateTime.substring(0, 16).replace(' ', 'T');
}