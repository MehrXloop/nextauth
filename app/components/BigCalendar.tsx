import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Calendar,
  DateLocalizer,
  momentLocalizer,
  Views,
} from 'react-big-calendar';
const mLocalizer = momentLocalizer(moment);

interface BasicProps {
  localizer?: DateLocalizer;
  showDemoLink?: boolean;
  // Other props if needed
}

const ColoredDateCellWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  React.cloneElement(React.Children.only(children) as React.ReactElement, {
    style: {
      backgroundColor: 'lightblue',
    },
  })
);

const Basic: React.FC<BasicProps> = ({
  localizer = mLocalizer,
  showDemoLink = true,
  ...props
}) => {
  const { components, defaultDate, views } = useMemo(
    () => ({
      components: {
        timeSlotWrapper: ColoredDateCellWrapper,
      },
      defaultDate: new Date(2015, 3, 1),
      // max: dates.add(dates.endOf(new Date(2015, 17, 1), 'day'), -1, 'hours'),
      views: Object.keys(Views).map((k) => (Views as Record<string, any>)[k]),
    }),
    []
  );

  return (
      <div style={{height:'90vh'}} {...props}>
        <Calendar
          // components={components}
          // defaultDate={defaultDate}
          // events={events}
          localizer={localizer}
          // max={max}
          showMultiDayTimes
          step={60}
          views={views}
        />
      </div>
  );
};

Basic.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
  showDemoLink: PropTypes.bool,
};

export default Basic;
