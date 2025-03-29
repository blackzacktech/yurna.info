import { cva } from "class-variance-authority";
import { AlertTriangle, ChevronDown, ChevronRight, ChevronUp, Eye, GalleryVerticalEnd, HelpCircle, Link2, Link2Off, LogOut, MessageSquare, MessageSquareCode, MessageSquarePlus, ScrollText, SquareSlash, X, UserPlus, UserMinus, CornerDownRight, ChevronLeft, EyeOff, RotateCw, UserX, MessageSquareWarning, AtSign, MessageSquareOff, Paintbrush2, FileJson, FileSpreadsheet, ThumbsUp, MessageSquareDot, ArrowDownNarrowWide, ArrowUpNarrowWide, Users } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
 ...LucideIcons,
 arrowDown: ChevronDown,
 arrowUp: ChevronUp,
 arrowLeft: ChevronLeft,
 arrowRight: ChevronRight,
 close: X,
 help: HelpCircle,
 warning: AlertTriangle,
 dashboard: GalleryVerticalEnd,
 slash: SquareSlash,
 comment: MessageSquare,
 commentAdd: MessageSquarePlus,
 link: Link2,
 unlink: Link2Off,
 cornerRight: CornerDownRight,
 refresh: RotateCw,
 mention: AtSign,
 viewing: Eye,
 hide: EyeOff,
 userAdd: UserPlus,
 userMinus: UserMinus,
 userBlock: UserX,
 list: ScrollText,
 messageCode: MessageSquareCode,
 messageWarning: MessageSquareWarning,
 messageOff: MessageSquareOff,
 messageDot: MessageSquareDot,
 sortAscending: ArrowUpNarrowWide,
 sortDescending: ArrowDownNarrowWide,
 logout: LogOut,
 paintBrush: Paintbrush2,
 fileJSON: FileJson,
 fileCSV: FileSpreadsheet,
 like: ThumbsUp,
 Users: Users,
 HandShake: ({ ...props }: LucideIcons.LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
   <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
   <path d="M11 12.5V10a2 2 0 0 1 2-2h2.5"></path>
   <path d="M17.5 8H20a2 2 0 0 1 2 2v2.5"></path>
   <path d="M11 12.5H8.5a2 2 0 0 0-2 2v2"></path>
   <path d="M11 12.5H9a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h2"></path>
  </svg>
 ),
 twitter: ({ ...props }: LucideIcons.LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
   <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
 ),
 discord: ({ ...props }: LucideIcons.LucideProps) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
   <path fill="currentColor" d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" />
  </svg>
 ),
};

export const iconVariants = cva("", {
 variants: {
  variant: {
   normal: "size-5 shrink-0",
   small: "size-4 shrink-0",
   large: "size-6 shrink-0",
   extraLarge: "size-8 shrink-0",
   button: "-ml-1 mr-2 size-5 shrink-0",
  },
 },
 defaultVariants: {
  variant: "normal",
 },
});
