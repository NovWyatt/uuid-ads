import writeExcelFile, { type CellObject, type SheetData } from 'write-excel-file/universal';

export interface FBMember {
    profileId: string
    fullName: string
    profileLink: string
    bio: string
    imageSrc: string
    groupId: string
    groupJoiningText: string
    profileType: string
}

// A profile.php?id= link always opens the right person, even after a username change.
export const profileIdLink = (id: string) => /^\d+$/.test(id) ? `https://www.facebook.com/profile.php?id=${id}` : '';

interface Column {
    header: string
    width: number
    value: (m: FBMember) => string
    link?: boolean
}

export const COLUMNS: Column[] = [
    { header: 'Profile Id', width: 18, value: m => m.profileId },
    { header: 'Full Name', width: 28, value: m => m.fullName },
    { header: 'Profile Link', width: 42, value: m => m.profileLink, link: true },
    { header: 'Profile Link (Id)', width: 54, value: m => profileIdLink(m.profileId), link: true },
    { header: 'Bio', width: 40, value: m => m.bio },
    { header: 'ImageSrc', width: 24, value: m => m.imageSrc },
    { header: 'GroupId', width: 18, value: m => m.groupId },
    { header: 'Group Joining Text', width: 28, value: m => m.groupJoiningText },
    { header: 'Profile Type', width: 12, value: m => m.profileType },
];

export function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// Names and bios are typed by strangers; a leading = + - @ would run as a formula in Excel.
export const neutralizeFormula = (v: string) => /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;

export function toCsv(rows: string[][]): Blob {
    const escape = (v: string) => {
        const s = neutralizeFormula(v ?? '');
        return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const body = rows.map(r => r.map(escape).join(',')).join('\r\n');
    // The BOM makes Excel read the file as UTF-8 instead of the Windows code page.
    return new Blob(['﻿' + body + '\r\n'], { type: 'text/csv;charset=utf-8' });
}

export const isFacebookUrl = (url: string) => /^https:\/\/(www|web|m)\.facebook\.com\/[^"]*$/.test(url) && url.length <= 255;

export async function toXlsx(rows: string[][], sheet: string): Promise<Blob> {
    const [header, ...data] = rows;
    const headerRow: CellObject[] = header.map(value => ({
        value,
        fontWeight: 'bold',
        backgroundColor: '#E8F5EF',
        bottomBorderStyle: 'thin',
        bottomBorderColor: '#9CCDB8',
    }));
    // Every cell is a String so long IDs stay exact; Excel would otherwise round them past 15 digits.
    const dataRows = data.map(row => row.map((value, i): CellObject => {
        if (COLUMNS[i]?.link && value && isFacebookUrl(value)) {
            return {
                type: 'Formula',
                // SpreadsheetML stores formulas without the leading "=".
                value: `HYPERLINK("${value}","${value}")`,
                textColor: '#0563C1',
                textDecoration: { underline: true },
            };
        }
        return { type: String, value: value ?? '' };
    }));
    const sheetData: SheetData = [headerRow, ...dataRows];
    return writeExcelFile(sheetData, {
        sheet,
        columns: COLUMNS.map(c => ({ width: c.width })),
        stickyRowsCount: 1,
    }).toBlob();
}
