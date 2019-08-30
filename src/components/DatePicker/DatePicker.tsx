import React, {useState, useEffect, useCallback} from 'react';
import {ArrowLeftMinor, ArrowRightMinor} from '@shopify/polaris-icons';
import {
  Range,
  Months,
  Year,
  isDateAfter,
  isDateBefore,
  getNextDisplayYear,
  getNextDisplayMonth,
  getPreviousDisplayYear,
  getPreviousDisplayMonth,
  Weekdays,
  isSameDay,
} from '@shopify/javascript-utilities/dates';

import {
  withAppProvider,
  WithAppProviderProps,
} from '../../utilities/with-app-provider';
import {Button} from '../Button';
import {useI18n} from '../../utilities/i18n';
import {monthName} from './utilities';

import {Month} from './components';
import styles from './DatePicker.scss';

export {Range, Months, Year};

export interface BaseProps {
  /** ID for the element */
  id?: string;
  /** The selected date or range of dates */
  selected?: Date | Range;
  /** The month to show */
  month: Months;
  /** The year to show */
  year: Year;
  /** Allow a range of dates to be selected */
  allowRange?: boolean;
  /** Disable selecting dates before this. */
  disableDatesBefore?: Date;
  /** Disable selecting dates after this. */
  disableDatesAfter?: Date;
  /** The selection can span multiple months */
  multiMonth?: boolean;
  /** First day of week. Sunday by default */
  weekStartsOn?: Weekdays;
  /** Callback when date is selected. */
  onChange?(date: Range): void;
  /** Callback when month is changed. */
  onMonthChange?(month: Months, year: Year): void;
}

export interface DatePickerProps extends BaseProps {}

function DatePicker({
  id,
  selected,
  month,
  year,
  allowRange,
  multiMonth,
  disableDatesBefore,
  disableDatesAfter,
  weekStartsOn = Weekdays.Sunday,
  onMonthChange,
  onChange = noop,
}: DatePickerProps) {
  const i18n = useI18n();
  const [hoverDate, setHoverDate] = useState<Date | undefined>(undefined);
  const [focusDate, setFocusDate] = useState<Date | undefined>(undefined);

  useEffect(
    () => {
      setFocusDate(undefined);
    },
    [selected],
  );

  const handleFocus = useCallback((date: Date) => {
    setFocusDate(date);
  }, []);

  const setFocusDateAndHandleMonthChange = (date: Date) => {
    if (onMonthChange) {
      onMonthChange(date.getMonth(), date.getFullYear());
    }
    setHoverDate(date);
    setFocusDate(date);
  };

  const handleDateSelection = useCallback(
    (range: Range) => {
      const {end} = range;

      setHoverDate(end);
      setFocusDate(new Date(end));
      onChange(range);
    },
    [onChange],
  );

  // private handleDateSelection = (range: Range) => {
  //   const {end} = range;
  //   const {onChange = noop} = this.props;

  //   this.setState({hoverDate: end, focusDate: new Date(end)}, () =>
  //     onChange(range),
  //   );
  // };

  // private handleMonthChangeClick = (month: Months, year: Year) => {
  //   const {onMonthChange} = this.props;
  //   if (!onMonthChange) {
  //     return;
  //   }
  //   this.setState({
  //     focusDate: undefined,
  //   });

  //   onMonthChange(month, year);
  // };

  // private handleHover = (date: Date) => {
  //   this.setState({
  //     hoverDate: date,
  //   });
  // };

  // private handleKeyUp = (event: React.KeyboardEvent<HTMLElement>) => {
  //   const {key} = event;
  //   const {selected, disableDatesBefore, disableDatesAfter} = this.props;

  //   const {focusDate} = this.state;
  //   const range = deriveRange(selected);
  //   const focusedDate = focusDate || (range && range.start);

  //   if (focusedDate == null) {
  //     return;
  //   }

  //   if (key === 'ArrowUp') {
  //     const previousWeek = new Date(focusedDate);
  //     previousWeek.setDate(focusedDate.getDate() - 7);
  //     if (
  //       !(disableDatesBefore && isDateBefore(previousWeek, disableDatesBefore))
  //     ) {
  //       this.setFocusDateAndHandleMonthChange(previousWeek);
  //     }
  //   }

  //   if (key === 'ArrowDown') {
  //     const nextWeek = new Date(focusedDate);
  //     nextWeek.setDate(focusedDate.getDate() + 7);
  //     if (!(disableDatesAfter && isDateAfter(nextWeek, disableDatesAfter))) {
  //       this.setFocusDateAndHandleMonthChange(nextWeek);
  //     }
  //   }

  //   if (key === 'ArrowRight') {
  //     const tomorrow = new Date(focusedDate);
  //     tomorrow.setDate(focusedDate.getDate() + 1);
  //     if (!(disableDatesAfter && isDateAfter(tomorrow, disableDatesAfter))) {
  //       this.setFocusDateAndHandleMonthChange(tomorrow);
  //     }
  //   }

  //   if (key === 'ArrowLeft') {
  //     const yesterday = new Date(focusedDate);
  //     yesterday.setDate(focusedDate.getDate() - 1);
  //     if (
  //       !(disableDatesBefore && isDateBefore(yesterday, disableDatesBefore))
  //     ) {
  //       this.setFocusDateAndHandleMonthChange(yesterday);
  //     }
  //   }
  // };

  const showNextYear = getNextDisplayYear(month, year);
  const showNextMonth = getNextDisplayMonth(month);

  const showNextToNextYear = getNextDisplayYear(showNextMonth, showNextYear);
  const showNextToNextMonth = getNextDisplayMonth(showNextMonth);

  const showPreviousYear = getPreviousDisplayYear(month, year);
  const showPreviousMonth = getPreviousDisplayMonth(month);

  const previousMonthName = i18n.translate(
    `Polaris.DatePicker.months.${monthName(showPreviousMonth)}`,
  );
  const nextMonth = multiMonth
    ? i18n.translate(
        `Polaris.DatePicker.months.${monthName(showNextToNextMonth)}`,
      )
    : i18n.translate(`Polaris.DatePicker.months.${monthName(showNextMonth)}`);
  const nextYear = multiMonth ? showNextToNextYear : showNextYear;

  const secondDatePicker = multiMonth ? (
    <Month
      onFocus={this.handleFocus}
      focusedDate={focusDate}
      month={showNextMonth}
      year={showNextYear}
      selected={deriveRange(selected)}
      hoverDate={hoverDate}
      onChange={this.handleDateSelection}
      onHover={this.handleHover}
      disableDatesBefore={disableDatesBefore}
      disableDatesAfter={disableDatesAfter}
      allowRange={allowRange}
      weekStartsOn={weekStartsOn}
    />
  ) : null;

  return (
    <div
      id={id}
      className={styles.DatePicker}
      onKeyDown={handleKeyDown}
      onKeyUp={this.handleKeyUp}
    >
      <div className={styles.Header}>
        <Button
          plain
          icon={ArrowLeftMinor}
          accessibilityLabel={i18n.translate(
            'Polaris.DatePicker.previousMonth',
            {
              previousMonthName,
              showPreviousYear,
            },
          )}
          onClick={this.handleMonthChangeClick.bind(
            null,
            showPreviousMonth,
            showPreviousYear,
          )}
        />
        <Button
          plain
          icon={ArrowRightMinor}
          accessibilityLabel={i18n.translate('Polaris.DatePicker.nextMonth', {
            nextMonth,
            nextYear,
          })}
          onClick={this.handleMonthChangeClick.bind(
            null,
            showNextMonth,
            showNextYear,
          )}
        />
      </div>
      <div className={styles.MonthContainer}>
        <Month
          onFocus={this.handleFocus}
          focusedDate={focusDate}
          month={month}
          year={year}
          selected={deriveRange(selected)}
          hoverDate={hoverDate}
          onChange={this.handleDateSelection}
          onHover={this.handleHover}
          disableDatesBefore={disableDatesBefore}
          disableDatesAfter={disableDatesAfter}
          allowRange={allowRange}
          weekStartsOn={weekStartsOn}
        />
        {secondDatePicker}
      </div>
    </div>
  );
}

function noop() {}

function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
  const {key} = event;

  if (
    key === 'ArrowUp' ||
    key === 'ArrowDown' ||
    key === 'ArrowLeft' ||
    key === 'ArrowRight'
  ) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function isSameSelectedDate(
  previousDate?: DatePickerProps['selected'],
  currentDate?: DatePickerProps['selected'],
) {
  if (previousDate == null || currentDate == null) {
    return previousDate == null && currentDate == null;
  }

  if (previousDate instanceof Date || currentDate instanceof Date) {
    return (
      previousDate instanceof Date &&
      currentDate instanceof Date &&
      isSameDay(previousDate, currentDate)
    );
  }

  return (
    isSameDay(previousDate.start, currentDate.start) &&
    isSameDay(previousDate.end, currentDate.end)
  );
}

function deriveRange(selected?: Date | Range) {
  return selected instanceof Date ? {start: selected, end: selected} : selected;
}

// Use named export once withAppProvider is refactored away
// eslint-disable-next-line import/no-default-export
export default withAppProvider<DatePickerProps>()(DatePicker);
