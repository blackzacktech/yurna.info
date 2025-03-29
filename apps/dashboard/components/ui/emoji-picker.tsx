import React, { useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

interface EmojiPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
        >
          <span>{value}</span>
          <span className="text-xs text-muted-foreground ml-2">Emoji auswählen</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Picker
          data={data}
          onEmojiSelect={(emoji: any) => {
            onChange(emoji.native);
            setOpen(false);
          }}
          theme={theme === 'dark' ? 'dark' : 'light'}
          previewPosition="none"
          skinTonePosition="none"
        />
      </PopoverContent>
    </Popover>
  );
}
