export function formatFileSize(bytes: string): string {
    const value = Number(bytes);

    if (!Number.isFinite(value) || value < 0) {
        return '—';
    }

    if (value < 1024) {
        return `${value} B`;
    }

    const units = ['KB', 'MB', 'GB', 'TB'];
    let size = value / 1024;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }

    return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

export function formatRelativeDate(isoDate: string): string {
    const days = Math.floor(
        (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (days <= 0) {
        return 'Hôm nay';
    }

    if (days === 1) {
        return 'Hôm qua';
    }

    if (days < 7) {
        return `${days} ngày trước`;
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(isoDate));
}

export function formatDateTime(isoDate: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(isoDate));
}
