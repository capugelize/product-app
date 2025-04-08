import { Card } from 'antd';
import CalendarView from '../components/CalendarView';

const CalendarPage = () => {
  return (
    <div className="calendar-page">
      <h1>Calendrier</h1>
      <Card>
        <CalendarView />
      </Card>
    </div>
  );
};

export default CalendarPage; 