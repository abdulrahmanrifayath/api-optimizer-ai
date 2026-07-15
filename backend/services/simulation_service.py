class SimulationService:
    """
    Simulates the impact of applying an AI optimization.
    No real infrastructure changes are performed.
    """

    def simulate(self, action_id: int):

        simulations = {

            1: {

                "action": "Scale Backend Instances",

                "response_time_before": 140,
                "response_time_after": 95,

                "health_before": 90,
                "health_after": 98,

                "error_before": 2.5,
                "error_after": 0.8,

                "requests_before": 1000,
                "requests_after": 1300,

                "improvement": "30% faster response time",

                "risk": "Low",

                "estimated_time": "15 Minutes",

                "estimated_cost": "$20/month",

                "rollback": "Reduce instance count if traffic decreases.",

                "implementation": [
                    "Provision one additional API instance.",
                    "Register the instance with the load balancer.",
                    "Verify API health checks.",
                    "Monitor CPU and response time."
                ]
            },

            2: {

                "action": "Enable Redis Cache",

                "response_time_before": 140,
                "response_time_after": 75,

                "health_before": 88,
                "health_after": 99,

                "error_before": 1.8,
                "error_after": 0.5,

                "requests_before": 1000,
                "requests_after": 1000,

                "improvement": "40% lower latency",

                "risk": "Very Low",

                "estimated_time": "10 Minutes",

                "estimated_cost": "$5/month",

                "rollback": "Disable Redis and remove cache middleware.",

                "implementation": [
                    "Install Redis.",
                    "Configure Redis connection.",
                    "Cache frequently accessed GET endpoints.",
                    "Restart the backend service."
                ]
            },

            3: {

                "action": "Investigate API Errors",

                "response_time_before": 120,
                "response_time_after": 110,

                "health_before": 82,
                "health_after": 94,

                "error_before": 8,
                "error_after": 1,

                "requests_before": 1000,
                "requests_after": 1000,

                "improvement": "Error rate reduced",

                "risk": "Medium",

                "estimated_time": "30 Minutes",

                "estimated_cost": "$0",

                "rollback": "Restore previous API version if required.",

                "implementation": [
                    "Review application logs.",
                    "Identify failing endpoints.",
                    "Fix server-side exceptions.",
                    "Deploy the updated API."
                ]
            },

            4: {

                "action": "Investigate Traffic Anomaly",

                "response_time_before": 160,
                "response_time_after": 105,

                "health_before": 75,
                "health_after": 93,

                "error_before": 10,
                "error_after": 2,

                "requests_before": 900,
                "requests_after": 900,

                "improvement": "Traffic stabilized",

                "risk": "High",

                "estimated_time": "20 Minutes",

                "estimated_cost": "$0",

                "rollback": "Remove temporary security rules after verification.",

                "implementation": [
                    "Inspect suspicious traffic.",
                    "Verify authentication logs.",
                    "Apply rate limiting if required.",
                    "Continue monitoring traffic."
                ]
            },

            5: {

                "action": "Optimize Database Queries",

                "response_time_before": 150,
                "response_time_after": 110,

                "health_before": 91,
                "health_after": 97,

                "error_before": 2,
                "error_after": 1,

                "requests_before": 1000,
                "requests_after": 1000,

                "improvement": "20% lower DB latency",

                "risk": "Low",

                "estimated_time": "25 Minutes",

                "estimated_cost": "$0",

                "rollback": "Restore previous SQL queries.",

                "implementation": [
                    "Identify slow SQL queries.",
                    "Create database indexes.",
                    "Optimize JOIN operations.",
                    "Verify execution plans."
                ]
            },

            6: {

                "action": "Continue Monitoring",

                "response_time_before": 90,
                "response_time_after": 90,

                "health_before": 100,
                "health_after": 100,

                "error_before": 0,
                "error_after": 0,

                "requests_before": 1000,
                "requests_after": 1000,

                "improvement": "System already optimized",

                "risk": "None",

                "estimated_time": "0 Minutes",

                "estimated_cost": "$0",

                "rollback": "No rollback required.",

                "implementation": [
                    "Continue monitoring API traffic.",
                    "Review AI recommendations periodically.",
                    "Track response time trends."
                ]
            }

        }

        return simulations.get(

            action_id,

            {

                "message": "Simulation unavailable"

            }

        )