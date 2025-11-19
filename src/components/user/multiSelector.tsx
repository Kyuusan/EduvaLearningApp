'use client';
import * as React from 'react';
import { CheckIcon, XCircle, ChevronDown, XIcon } from 'lucide-react';
import { Poppins } from 'next/font/google';

import { cn } from '../../../lib/utils';
import { Button } from '@/components/user/multiSelector/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/user/multiSelector/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/user/multiSelector/command';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option object has a label, value, and an optional icon.
   */
  options: {
    /** The text to display for the option. */
    label: string;
    /** The unique value associated with the option. */
    value: string;
    /** Optional icon component to display alongside the option. */
    icon?: React.ComponentType<{ className?: string }>;
    disable?: boolean;
  }[];

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: string[]) => void;

  /** The default selected values when the component mounts. */
  defaultValue?: string[];

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string;

  /**
   * Animation duration in seconds for the visual effects (e.g., bouncing badges).
   * Optional, defaults to 0 (no animation).
   */
  animation?: number;

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number;

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;

  /**
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean;

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string;
  popoverClass?: string;
  showall?: boolean;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      defaultValue = [],
      placeholder = 'Select options',
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      asChild = false,
      className,
      popoverClass,
      showall = false,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] =
      React.useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === 'Enter') {
        setIsPopoverOpen(true);
      } else if (event.key === 'Backspace' && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (option: string) => {
      const newSelectedValues = selectedValues.includes(option)
        ? selectedValues.filter((value) => value !== option)
        : [...selectedValues, option];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };
    const filteredOptions = options.filter((option) => !option.disable);
    const toggleAll = () => {
      if (selectedValues.length === filteredOptions.length) {
        handleClear();
      } else {
        const allValues = filteredOptions.map((option) => option.value);
        setSelectedValues(allValues);
        onValueChange(allValues);
      }
    };

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              `${poppins.className} flex w-full p-1.5 rounded-lg border-2 min-h-11 h-auto items-center justify-between bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-200`,
              className
            )}
          >
            {selectedValues.length > 0 ? (
              <div className='flex justify-between items-center w-full'>
                <div className='flex flex-wrap items-center gap-1.5 p-1'>
                  {(showall
                    ? selectedValues
                    : selectedValues.slice(0, maxCount)
                  ).map((value) => {
                    const option = options.find((o) => o.value === value);
                    const IconComponent = option?.icon;
                    return (
                      <div
                        key={value}
                        className={cn(
                          'inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm hover:shadow-md transition-all duration-200'
                        )}
                      >
                        {IconComponent && (
                          <IconComponent className='h-3.5 w-3.5 mr-1.5' />
                        )}
                        {option?.label}
                        <XCircle
                          className='ml-1.5 h-3.5 w-3.5 cursor-pointer hover:text-blue-100 transition-colors'
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleOption(value);
                          }}
                        />
                      </div>
                    );
                  })}
                  {!showall && selectedValues.length > maxCount && (
                    <div
                      className={cn(
                        'inline-flex items-center border-2 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200'
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {`+ ${selectedValues.length - maxCount} more`}
                      <XCircle
                        className='ml-1.5 h-3.5 w-3.5 cursor-pointer hover:text-blue-900 dark:hover:text-blue-100'
                        onClick={(event) => {
                          event.stopPropagation();
                          clearExtraOptions();
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className='flex items-center justify-between gap-1'>
                  <XIcon
                    className='h-4 w-4 cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors'
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClear();
                    }}
                  />
                  <ChevronDown className='h-4 w-4 cursor-pointer text-blue-600 dark:text-blue-400 transition-transform duration-200' />
                </div>
              </div>
            ) : (
              <div className='flex items-center justify-between w-full mx-auto'>
                <span className='text-sm text-gray-500 dark:text-gray-400 mx-3'>
                  {placeholder}
                </span>
                <ChevronDown className='h-4 w-4 cursor-pointer text-gray-400 dark:text-gray-500 mx-2 transition-transform duration-200' />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(`${poppins.className} w-auto p-0 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-xl`, popoverClass)}
          align='start'
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command className='bg-transparent'>
            <CommandInput
              placeholder='Search...'
              onKeyDown={handleInputKeyDown}
              className='border-b-2 border-gray-200 dark:border-gray-700'
            />
            <CommandList>
              <CommandEmpty className='py-6 text-center text-sm text-gray-500 dark:text-gray-400'>
                No results found.
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key='all'
                  onSelect={toggleAll}
                  className='cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors duration-150'
                >
                  <div
                    className={cn(
                      'mr-2 flex h-4 w-4 items-center justify-center rounded border-2 transition-all duration-200',
                      selectedValues.length === filteredOptions.length
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 opacity-70 [&_svg]:invisible'
                    )}
                  >
                    <CheckIcon className='h-3 w-3' strokeWidth={3} />
                  </div>
                  <span className='font-medium text-gray-700 dark:text-gray-300'>(Select All)</span>
                </CommandItem>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  const isDisabled = option.disable;

                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => !isDisabled && toggleOption(option.value)}
                      className={cn(
                        'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors duration-150',
                        isDisabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                      )}
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded border-2 transition-all duration-200',
                          isSelected
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 opacity-70 [&_svg]:invisible'
                        )}
                      >
                        {!isDisabled && <CheckIcon className='h-3 w-3' strokeWidth={3} />}
                      </div>
                      {option.icon && (
                        <option.icon
                          className={cn(
                            'mr-2 h-4 w-4',
                            isDisabled ? 'text-gray-400 dark:text-gray-600' : 'text-blue-600 dark:text-blue-400'
                          )}
                        />
                      )}
                      <span className={cn(
                        'text-gray-700 dark:text-gray-300',
                        isDisabled && 'text-gray-400 dark:text-gray-600'
                      )}>
                        {option.label}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator className='bg-gray-200 dark:bg-gray-700' />
              <CommandGroup>
                <div className='flex items-center justify-between'>
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        className='flex-1 justify-center cursor-pointer border-r-2 border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold transition-colors duration-150'
                      >
                        Clear
                      </CommandItem>
                    </>
                  )}
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    className='flex-1 justify-center cursor-pointer max-w-full hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold transition-colors duration-150'
                  >
                    Close
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';