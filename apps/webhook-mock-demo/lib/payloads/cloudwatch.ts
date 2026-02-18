import { randomUUID } from "crypto";

export function generateCloudWatchPayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const now = new Date().toISOString();
  const region = "us-east-1";
  const accountId = "123456789012";

  switch (eventType) {
    case "alarm_state": {
      const states = ["ALARM", "OK", "INSUFFICIENT_DATA"] as const;
      const state = states[Math.floor(Math.random() * states.length)];
      const alarmName = `High-ErrorRate-API-${randomUUID().substring(0, 8)}`;
      return {
        payload: {
          version: "1.0",
          id: randomUUID(),
          "detail-type": "CloudWatch Alarm State Change",
          source: "aws.cloudwatch",
          account: accountId,
          time: now,
          region,
          resources: [`arn:aws:cloudwatch:${region}:${accountId}:alarm:${alarmName}`],
          detail: {
            alarmName,
            state: {
              value: state,
              reason: state === "ALARM"
                ? "Threshold Crossed: 1 datapoint [5.2 (%)] was greater than the threshold (5.0)."
                : state === "OK"
                  ? "Threshold Crossed: 1 datapoint [2.1 (%)] was less than the threshold (5.0)."
                  : "Insufficient Data: 1 datapoint was missing.",
              reasonData: "{}",
              timestamp: now,
            },
            previousState: {
              value: state === "ALARM" ? "OK" : "ALARM",
              reason: "Testing",
              timestamp: new Date(Date.now() - 300000).toISOString(),
            },
            configuration: {
              metrics: [
                {
                  id: "m1",
                  metricStat: {
                    metric: { namespace: "AWS/ApplicationELB", name: "HTTPCode_Target_5XX_Count", dimensions: { LoadBalancer: "app/api" } },
                    period: 60,
                    stat: "Sum",
                  },
                  returnData: true,
                },
              ],
              evaluationPeriods: 1,
              threshold: 5,
              comparisonOperator: "GreaterThanThreshold",
            },
          },
        },
        headers: { "Content-Type": "application/json", "X-CloudWatch-Event": "alarm" },
      };
    }

    case "log_metric_filter": {
      const logGroup = "/aws/lambda/api-handler";
      const filterName = "ErrorCountFilter";
      return {
        payload: {
          version: "1.0",
          id: randomUUID(),
          "detail-type": "CloudWatch Logs Metric Filter",
          source: "aws.logs",
          account: accountId,
          time: now,
          region,
          detail: {
            logGroup,
            filterName,
            metricNamespace: "App/Errors",
            metricName: "ErrorCount",
            metricValue: 47,
            triggerValue: 10,
            logEvents: [
              { id: randomUUID(), timestamp: Date.now(), message: '{"level":"error","message":"Connection refused"}' },
            ],
          },
        },
        headers: { "Content-Type": "application/json", "X-CloudWatch-Event": "logs" },
      };
    }

    case "anomaly_detection": {
      const alarmName = `Anomaly-CPUUtilization-${randomUUID().substring(0, 8)}`;
      return {
        payload: {
          version: "1.0",
          id: randomUUID(),
          "detail-type": "CloudWatch Alarm State Change",
          source: "aws.cloudwatch",
          account: accountId,
          time: now,
          region,
          resources: [`arn:aws:cloudwatch:${region}:${accountId}:alarm:${alarmName}`],
          detail: {
            alarmName,
            state: {
              value: "ALARM",
              reason: "Anomaly Detected: CPU utilization is 2.3 standard deviations above the model.",
              reasonData: JSON.stringify({
                trigger: { metric: "CPUUtilization", statistic: "Average", value: 89.2, baseline: 45, bands: 2.3 },
              }),
              timestamp: now,
            },
            previousState: { value: "OK", reason: "Normal", timestamp: new Date(Date.now() - 600000).toISOString() },
            configuration: {
              metrics: [{ id: "m1", metricStat: { metric: { namespace: "AWS/EC2", name: "CPUUtilization" }, period: 300, stat: "Average" }, returnData: true }],
              evaluationPeriods: 2,
              thresholdMetricId: "e1",
            },
          },
        },
        headers: { "Content-Type": "application/json", "X-CloudWatch-Event": "anomaly" },
      };
    }

    case "composite_alarm": {
      const alarmName = `Composite-APIHealth-${randomUUID().substring(0, 8)}`;
      return {
        payload: {
          version: "1.0",
          id: randomUUID(),
          "detail-type": "CloudWatch Alarm State Change",
          source: "aws.cloudwatch",
          account: accountId,
          time: now,
          region,
          resources: [`arn:aws:cloudwatch:${region}:${accountId}:alarm:${alarmName}`],
          detail: {
            alarmName,
            state: {
              value: "ALARM",
              reason: "2 of 3 child alarms in ALARM state (High-5XX, High-Latency)",
              timestamp: now,
            },
            previousState: { value: "OK", reason: "All children OK", timestamp: new Date(Date.now() - 300000).toISOString() },
            configuration: {
              actionsEnabled: true,
              alarmRule: "ALARM(High-5XX) OR ALARM(High-Latency) OR ALARM(High-ErrorCount)",
              alarmDescription: "Composite: API health degraded",
            },
          },
        },
        headers: { "Content-Type": "application/json", "X-CloudWatch-Event": "composite_alarm" },
      };
    }

    case "insights_alarm": {
      const alarmName = `ContributorInsights-TopErrors-${randomUUID().substring(0, 8)}`;
      return {
        payload: {
          version: "1.0",
          id: randomUUID(),
          "detail-type": "CloudWatch Contributor Insights Alarm",
          source: "aws.cloudwatch",
          account: accountId,
          time: now,
          region,
          resources: [`arn:aws:cloudwatch:${region}:${accountId}:alarm:${alarmName}`],
          detail: {
            alarmName,
            state: {
              value: "ALARM",
              reason: "Top contributor changed: new endpoint /api/checkout now accounts for 45% of 5xx errors",
              timestamp: now,
              dimensions: {
                LogGroup: "/aws/application/API",
                TopContributor: "/api/checkout",
                Contribution: 45.2,
                Metric: "5xx_count",
              },
            },
          },
        },
        headers: { "Content-Type": "application/json", "X-CloudWatch-Event": "insights_alarm" },
      };
    }

    default:
      throw new Error(`Unknown CloudWatch event type: ${eventType}`);
  }
}
