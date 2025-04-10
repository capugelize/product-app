import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Space, Progress, Tag, Tabs, List, Empty, Alert, Timeline } from 'antd';
import { useAppContext } from '../context/AppContext';
import { usePomodoro } from '../context/PomodoroContext';
import moment from 'moment';
import ProductivityStats from './ProductivityStats';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Analysis = () => {
  const { tasks } = useAppContext();
  const { taskTimeSpent, taskProgress, taskProductivity, getTaskStepDescription } = usePomodoro();
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [productivityAnalysis, setProductivityAnalysis] = useState({
    peakHours: [],
    productivityByTime: {},
    optimalDuration: 0,
    suggestedSchedule: [],
  });
  const [classifiedTasks, setClassifiedTasks] = useState({
    urgent: [],
    important: [],
    routine: [],
    optional: []
  });

  // Initial setup for productivity analysis
  useEffect(() => {
    if (tasks.length > 0) {
      analyzeProductivityPatterns();
      classifyTasksWithAI();
    }
  }, [tasks, taskProductivity, taskTimeSpent]);

  // Analyze productivity patterns based on task data
  useEffect(() => {
    if (Object.keys(taskTimeSpent).length > 0) {
      analyzeProductivityPatterns();
    }
  }, [taskTimeSpent, taskProductivity]);

  // Classify tasks using AI logic whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      classifyTasksWithAI();
    }
  }, [tasks, taskProductivity]);

  // Analyze productivity patterns and find the optimal times
  const analyzeProductivityPatterns = () => {
    // Extract all productivity data with timestamps
    const productivityData = [];
    
    // Get current timestamp to associate with task data (for this session)
    const currentHour = parseInt(moment().format('H'));
    
    // Analyze real productivity data from tasks
    Object.entries(taskProductivity).forEach(([taskId, data]) => {
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'average' && typeof value === 'number') {
          // Use task creation time or completion time as basis for timestamp
          // Find the corresponding task to get more info
          const task = tasks.find(t => t.id === taskId);
          
          // Extract hour of day from task data
          let taskHour;
          if (task?.createdAt) {
            // Use task creation time if available
            taskHour = moment(task.createdAt).hour();
          } else if (task?.deadline) {
            // Use task deadline if creation time not available
            taskHour = moment(task.deadline).hour();
          } else {
            // Fallback to current hour with slight variation
            taskHour = (currentHour + (key === 'step1' ? 0 : key === 'step2' ? 1 : -1)) % 24;
          }
          
          const timeInfo = {
            taskId,
            step: key,
            productivity: value,
            timeSpent: taskTimeSpent[taskId]?.[key] || 0,
            timestamp: taskHour
          }
          productivityData.push(timeInfo);
        }
      });
    });

    // If no productivity data available, generate minimal sample data
    if (productivityData.length === 0 && tasks.length > 0) {
      // Sample data based on task status
      tasks.forEach(task => {
        const taskHour = task.createdAt ? moment(task.createdAt).hour() : currentHour;
        const sampleProductivity = 
          task.status === 'completed' ? 85 : 
          task.status === 'in_progress' ? 60 : 40;
        
        productivityData.push({
          taskId: task.id,
          step: 'step1',
          productivity: sampleProductivity,
          timeSpent: 25,
          timestamp: taskHour
        });
      });
    }

    // Group by hour of day
    const productivityByHour = {};
    productivityData.forEach(data => {
      const hour = data.timestamp;
      if (!productivityByHour[hour]) {
        productivityByHour[hour] = [];
      }
      productivityByHour[hour].push(data.productivity);
    });

    // Calculate average productivity by hour
    const avgProductivityByHour = {};
    Object.entries(productivityByHour).forEach(([hour, values]) => {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      avgProductivityByHour[hour] = Math.round(avg);
    });

    // Find peak productivity hours (top 3)
    const sortedHours = Object.entries(avgProductivityByHour)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Determine optimal task duration based on most productive sessions
    const productiveSessions = productivityData
      .filter(data => data.productivity > 70) // Consider only high productivity sessions
      .map(data => data.timeSpent);
    
    const optimalDuration = productiveSessions.length > 0
      ? Math.round(productiveSessions.reduce((sum, val) => sum + val, 0) / productiveSessions.length)
      : 25; // Default to 25 minutes if no data

    // Generate suggested schedule based on peak hours and optimal duration
    const suggestedSchedule = sortedHours.map(hour => {
      const formattedHour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
      return {
        time: formattedHour,
        duration: optimalDuration,
        productivity: avgProductivityByHour[hour]
      };
    });

    setProductivityAnalysis({
      peakHours: sortedHours,
      productivityByTime: avgProductivityByHour,
      optimalDuration,
      suggestedSchedule
    });
  };

  // AI task classification based on priority, status, and productivity
  const classifyTasksWithAI = () => {
    // Initialize task categories
    const classified = {
      urgent: [],
      important: [],
      routine: [],
      optional: []
    };

    // AI classification logic
    tasks.forEach(task => {
      // Get productivity data if available
      const productivity = taskProductivity[task.id]?.average || 0;
      const timeSpent = taskTimeSpent[task.id]?.total || 0;
      
      // Calculate task score based on multiple factors
      let score = 0;
      
      // Priority factor (high impact)
      if (task.priority === 'high') score += 50;
      else if (task.priority === 'medium') score += 30;
      else score += 10;
      
      // Deadline factor (if applicable)
      if (task.deadline) {
        const daysUntilDeadline = moment(task.deadline).diff(moment(), 'days');
        
        if (daysUntilDeadline < 0) {
          // Task is overdue
          score += 40;
        } else if (daysUntilDeadline === 0) {
          // Deadline is today
          score += 35;
        } else if (daysUntilDeadline <= 1) {
          // Deadline is tomorrow
          score += 30;
        } else if (daysUntilDeadline <= 3) {
          // Deadline within 3 days
          score += 25;
        } else if (daysUntilDeadline <= 7) {
          // Deadline within a week
          score += 20;
        } else {
          // Far deadline
          score += 10;
        }
      }
      
      // Status factor
      if (task.status === 'in_progress') score += 15;
      else if (task.status === 'completed') score -= 15; // Lower priority for completed tasks
      
      // Productivity factor (boost score if task has high productivity)
      if (productivity > 70) score += 15;
      else if (productivity > 50) score += 10;
      
      // Task complexity factor (estimated by time spent)
      if (timeSpent > 60) score += 10; // Complex tasks get priority
      
      // Classify based on final score
      const taskWithScore = {
        ...task,
        aiScore: score,
        productivity: productivity,
        timeSpent: timeSpent
      };
      
      if (score >= 70) classified.urgent.push(taskWithScore);
      else if (score >= 50) classified.important.push(taskWithScore);
      else if (score >= 30) classified.routine.push(taskWithScore);
      else classified.optional.push(taskWithScore);
    });
    
    // Sort each category by score (highest first)
    Object.keys(classified).forEach(category => {
      classified[category].sort((a, b) => b.aiScore - a.aiScore);
    });
    
    setClassifiedTasks(classified);
  };

  const columns = [
    {
      title: 'Nom de la tâche',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical">
          <Text strong>{text}</Text>
          <Space>
            <Tag color={record.priority === 'high' ? 'red' : record.priority === 'medium' ? 'orange' : 'green'}>
              {record.priority}
            </Tag>
            <Tag>{record.category}</Tag>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'success' :
          status === 'in_progress' ? 'processing' :
          'default'
        }>
          {status === 'completed' ? '✅ Terminé' :
           status === 'in_progress' ? '🔧 En cours' :
           '⏳ À faire'}
        </Tag>
      ),
    },
    {
      title: 'Temps passé',
      dataIndex: 'timeSpent',
      key: 'timeSpent',
      render: (timeSpent) => (
        <Space direction="vertical">
          <Text strong>Total: {timeSpent.total || 0} minutes</Text>
          {Object.entries(timeSpent)
            .filter(([key]) => key.startsWith('step'))
            .map(([step, minutes]) => (
              <Text key={step} type="secondary">
                {step}: {minutes} minutes
              </Text>
            ))}
        </Space>
      ),
    },
    {
      title: 'Progression',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress, record) => (
        <Space direction="vertical">
          {Object.entries(progress).map(([step, value]) => {
            const description = getTaskStepDescription(record.key, step.replace('step', ''));
            return (
              <div key={step}>
                <Text strong>{step}</Text>
                <Progress
                  percent={parseInt(value) || 0}
                  size="small"
                  status={parseInt(value) === 100 ? 'success' : 'active'}
                />
                {description && (
                  <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                    {description}
                  </Text>
                )}
              </div>
            );
          })}
        </Space>
      ),
    },
    {
      title: 'Productivité',
      dataIndex: 'productivity',
      key: 'productivity',
      render: (productivity) => (
        <Progress
          percent={productivity.average || 0}
          size="small"
          status={productivity.average >= 70 ? 'success' : productivity.average >= 40 ? 'normal' : 'exception'}
        />
      ),
    },
  ];

  const data = tasks.map(task => ({
    key: task.id,
    name: task.name,
    priority: task.priority,
    category: task.category,
    status: task.status,
    timeSpent: taskTimeSpent[task.id] || {},
    progress: taskProgress[task.id] || {},
    productivity: taskProductivity[task.id] || { average: 0 },
  }));

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getTotalProductivity = () => {
    const tasks = Object.entries(taskProductivity);
    if (tasks.length === 0) return 0;
    
    const total = tasks.reduce((sum, [_, data]) => {
      return sum + (data.average || 0);
    }, 0);
    
    return Math.round(total / tasks.length);
  };

  const getTaskList = () => {
    return Object.entries(taskTimeSpent).map(([taskId, data]) => ({
      taskId,
      timeSpent: data,
      productivity: taskProductivity[taskId] || { average: 0 },
      progress: taskProgress[taskId] || {}
    }));
  };

  const hasData = Object.keys(taskTimeSpent).length > 0;

  // Render AI task classification card
  const renderTaskClassification = () => {
    const getCategoryColor = (category) => {
      switch(category) {
        case 'urgent': return 'red';
        case 'important': return 'orange';
        case 'routine': return 'blue';
        case 'optional': return 'green';
        default: return 'default';
      }
    };

    const getCategoryIcon = (category) => {
      switch(category) {
        case 'urgent': return '🔥';
        case 'important': return '⭐';
        case 'routine': return '📝';
        case 'optional': return '📌';
        default: return '📋';
      }
    };

    return (
      <Card title="Classification des tâches IA" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert 
            message="Classification de priorité des tâches" 
            description="L'IA a analysé vos tâches en fonction de leur priorité, échéances, progression et modèles de productivité pour suggérer un ordre optimal." 
            type="info" 
            showIcon 
            style={{ marginBottom: 16 }}
          />
          
          {Object.entries(classifiedTasks).map(([category, tasks]) => (
            <div key={category} style={{ marginBottom: 16 }}>
              <Title level={4}>
                {getCategoryIcon(category)} {category === 'urgent' ? 'Urgent' : 
                                                   category === 'important' ? 'Important' : 
                                                   category === 'routine' ? 'Routine' : 
                                                   category === 'optional' ? 'Optionnel' : category.charAt(0).toUpperCase() + category.slice(1)} Tâches
                <Tag color={getCategoryColor(category)} style={{ marginLeft: 8 }}>
                  {tasks.length}
                </Tag>
              </Title>
              
              {tasks.length > 0 ? (
                <List
                  size="small"
                  bordered
                  dataSource={tasks}
                  renderItem={task => (
                    <List.Item 
                      key={task.id}
                      extra={
                        <Space>
                          <Tag color={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'green'}>
                            {task.priority}
                          </Tag>
                          <Tag color="blue">Score: {task.aiScore}</Tag>
                        </Space>
                      }
                    >
                      <List.Item.Meta
                        title={task.name}
                        description={
                          <Text type="secondary">
                            {task.category} • {task.status === 'completed' ? 'Terminé' : 
                             task.status === 'in_progress' ? 'En cours' : 'À faire'}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description={`Aucune tâche ${category} trouvée`} />
              )}
            </div>
          ))}
        </Space>
      </Card>
    );
  };

  // Render productivity time analysis card
  const renderProductivityTimeAnalysis = () => {
    return (
      <Card title="Analyse du temps de productivité" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Title level={4}>Heures de productivité maximale</Title>
            {productivityAnalysis.peakHours.length > 0 ? (
              <Timeline>
                {productivityAnalysis.suggestedSchedule.map((schedule, index) => (
                  <Timeline.Item 
                    key={index} 
                    color={schedule.productivity >= 70 ? 'green' : 'blue'}
                  >
                    <Text strong>{schedule.time}</Text> - 
                    <Text> {schedule.productivity}% de productivité</Text>
                    <div>
                      <Text type="secondary">
                        Session suggérée : {schedule.duration} minutes
                      </Text>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="Pas assez de données pour déterminer les heures de pointe" />
            )}
          </div>
          
          <div>
            <Title level={4}>Durée optimale de session</Title>
            <Text>
              D'après vos tâches les plus productives, votre durée optimale de session de travail est de : 
              <Text strong style={{ marginLeft: 8 }}>
                {productivityAnalysis.optimalDuration} minutes
              </Text>
            </Text>
          </div>
          
          <Alert
            message="Aperçu de productivité"
            description={`Vous avez tendance à être plus productif pendant les heures ${productivityAnalysis.peakHours.map(h => h < 10 ? `0${h}:00` : `${h}:00`).join(', ')}. 
              Envisagez de planifier vos tâches les plus importantes pendant ces périodes pour des résultats optimaux.`}
            type="info"
            showIcon
          />
        </Space>
      </Card>
    );
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {!hasData && (
        <Alert
          message="Aucune donnée d'analyse disponible"
          description="Utilisez le minuteur Pomodoro avec vos tâches pour générer des données d'analyse."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {hasData && (
        <>
          <Card>
            <Title level={3}>Productivité générale</Title>
            <Progress
              percent={getTotalProductivity()}
              size="large"
              status={getTotalProductivity() >= 70 ? 'success' : getTotalProductivity() >= 40 ? 'normal' : 'exception'}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Basé sur {Object.keys(taskProductivity).length} tâches terminées
            </Text>
          </Card>

          {/* AI Task Classification */}
          {renderTaskClassification()}

          {/* Productivity Time Analysis */}
          {renderProductivityTimeAnalysis()}

          <Tabs defaultActiveKey="1">
            <TabPane tab="Aperçu des tâches" key="1">
              <Table
                columns={columns}
                dataSource={data}
                onRow={(record) => ({
                  onClick: () => setActiveTaskId(record.key),
                  style: { cursor: 'pointer' }
                })}
                rowClassName={(record) => record.key === activeTaskId ? 'selected-row' : ''}
              />
            </TabPane>
            <TabPane tab="Analyse détaillée" key="2">
              {activeTaskId ? (
                <ProductivityStats taskId={activeTaskId} />
              ) : (
                <Empty
                  description={
                    <Text>
                      Sélectionnez une tâche dans l'aperçu pour voir les statistiques détaillées
                    </Text>
                  }
                />
              )}
            </TabPane>
            <TabPane tab="Analyse de priorité des tâches" key="3">
              <Card>
                <Title level={4}>Distribution des priorités</Title>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 32 }}>
                  {Object.entries(classifiedTasks).map(([category, tasks]) => (
                    <div key={category} style={{ textAlign: 'center' }}>
                      <Progress
                        type="circle"
                        percent={Math.round((tasks.length / (tasks.length ? tasks.length : 1)) * 100)}
                        format={() => tasks.length}
                        status={
                          category === 'urgent' ? 'exception' :
                          category === 'important' ? 'warning' :
                          category === 'routine' ? 'active' : 'success'
                        }
                      />
                      <div style={{ marginTop: 8 }}>
                        <Text strong>{category === 'urgent' ? 'Urgent' : 
                                           category === 'important' ? 'Important' : 
                                           category === 'routine' ? 'Routine' : 
                                           category === 'optional' ? 'Optionnel' : category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                      </div>
                    </div>
                  ))}
                </div>
                <Alert
                  message="Recommandation IA"
                  description={
                    classifiedTasks.urgent.length > 0 
                      ? "Concentrez-vous sur les tâches urgentes pendant vos heures de productivité maximale pour une efficacité optimale."
                      : classifiedTasks.important.length > 0
                      ? "Vous avez bien géré les tâches urgentes. Concentrez-vous maintenant sur les tâches importantes pour éviter qu'elles ne deviennent urgentes."
                      : "Excellent travail ! Votre gestion des tâches est efficace. Envisagez de relever de nouveaux défis ou des projets à plus long terme."
                  }
                  type="info"
                  showIcon
                />
              </Card>
            </TabPane>
            <TabPane tab="Évolution de la productivité" key="4">
              <Card>
                <Title level={4}>Votre productivité au fil du temps</Title>
                {Object.keys(productivityAnalysis.productivityByTime).length > 0 ? (
                  <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end' }}>
                    {Object.entries(productivityAnalysis.productivityByTime)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([hour, value]) => (
                        <div 
                          key={hour} 
                          style={{ 
                            height: `${value}%`, 
                            width: '30px', 
                            margin: '0 4px',
                            background: value >= 70 ? '#52c41a' : value >= 40 ? '#1890ff' : '#ff4d4f',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            borderRadius: '3px 3px 0 0'
                          }}
                        >
                          {value}%
                          <div style={{ marginTop: '4px', fontSize: '9px' }}>
                            {hour}:00
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <Empty description="Pas assez de données pour afficher l'évolution de la productivité" />
                )}
              </Card>
            </TabPane>
          </Tabs>
        </>
      )}
    </Space>
  );
};

export default Analysis; 