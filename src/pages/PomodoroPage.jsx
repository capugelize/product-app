import { Card, Row, Col } from 'antd';
import PomodoroTimer from '../components/PomodoroTimer';

const PomodoroPage = () => {
  return (
    <div className="pomodoro-page">
      <h1>Pomodoro Timer</h1>
      <Row justify="center">
        <Col xs={24} md={16} lg={12}>
          <Card>
            <PomodoroTimer fullWidth />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PomodoroPage; 