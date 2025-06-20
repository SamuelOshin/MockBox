"""
Monitoring and logging service for rate limiting and security events
"""
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import asyncio
import json

logger = logging.getLogger(__name__)


class RateLimitMonitor:
    """Monitor and log rate limiting events"""
    
    def __init__(self):
        self.violations_cache = []  # In-memory cache for recent violations
        self.max_cache_size = 1000
        self.cache_ttl = timedelta(hours=24)

    async def log_rate_limit_violation(
        self,
        endpoint: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        violation_type: str = "unknown",
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Log rate limit violations for analysis"""
        violation_record = {
            "endpoint": endpoint,
            "user_id": user_id,
            "ip_address": ip_address,
            "violation_type": violation_type,
            "timestamp": datetime.utcnow(),
            "metadata": metadata or {}
        }
        
        try:
            # Add to in-memory cache
            self.violations_cache.append(violation_record)
            
            # Trim cache if too large
            if len(self.violations_cache) > self.max_cache_size:
                self.violations_cache = self.violations_cache[-self.max_cache_size:]
            
            # Log to application logs
            logger.warning(
                f"Rate limit violation: {violation_type} on {endpoint}",
                extra={
                    "user_id": user_id,
                    "ip_address": ip_address,
                    "endpoint": endpoint,
                    "violation_type": violation_type,
                    "metadata": metadata
                }
            )
            
            # TODO: Add database logging when database schema is updated
            # await self._log_to_database(violation_record)
            
        except Exception as e:
            logger.error(f"Failed to log rate limit violation: {e}")

    async def get_rate_limit_stats(self, timeframe: str = "24h") -> Dict[str, Any]:
        """Get rate limiting statistics"""
        try:
            # Calculate timeframe
            if timeframe == "1h":
                cutoff_time = datetime.utcnow() - timedelta(hours=1)
            elif timeframe == "24h":
                cutoff_time = datetime.utcnow() - timedelta(hours=24)
            elif timeframe == "7d":
                cutoff_time = datetime.utcnow() - timedelta(days=7)
            else:
                cutoff_time = datetime.utcnow() - timedelta(hours=24)
            
            # Filter violations by timeframe
            recent_violations = [
                v for v in self.violations_cache 
                if v["timestamp"] > cutoff_time
            ]
            
            # Calculate statistics
            stats = {
                "total_violations": len(recent_violations),
                "timeframe": timeframe,
                "period_start": cutoff_time.isoformat(),
                "period_end": datetime.utcnow().isoformat(),
                "violations_by_type": {},
                "violations_by_endpoint": {},
                "violations_by_ip": {},
                "violations_by_user": {},
                "hourly_breakdown": {}
            }
            
            # Aggregate by type
            for violation in recent_violations:
                v_type = violation["violation_type"]
                endpoint = violation["endpoint"]
                ip = violation["ip_address"]
                user_id = violation["user_id"]
                hour = violation["timestamp"].strftime("%Y-%m-%d %H:00")
                
                stats["violations_by_type"][v_type] = stats["violations_by_type"].get(v_type, 0) + 1
                stats["violations_by_endpoint"][endpoint] = stats["violations_by_endpoint"].get(endpoint, 0) + 1
                
                if ip:
                    stats["violations_by_ip"][ip] = stats["violations_by_ip"].get(ip, 0) + 1
                
                if user_id:
                    stats["violations_by_user"][user_id] = stats["violations_by_user"].get(user_id, 0) + 1
                
                stats["hourly_breakdown"][hour] = stats["hourly_breakdown"].get(hour, 0) + 1
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get rate limit stats: {e}")
            return {
                "error": "Failed to retrieve statistics",
                "total_violations": 0,
                "timeframe": timeframe
            }

    async def get_suspicious_activity(self, threshold: int = 50) -> List[Dict[str, Any]]:
        """Get potentially suspicious activity based on rate limit violations"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=1)
            recent_violations = [
                v for v in self.violations_cache 
                if v["timestamp"] > cutoff_time
            ]
            
            # Count violations by IP
            ip_counts = {}
            for violation in recent_violations:
                ip = violation["ip_address"]
                if ip:
                    ip_counts[ip] = ip_counts.get(ip, 0) + 1
            
            # Identify suspicious IPs
            suspicious_ips = [
                {
                    "ip_address": ip,
                    "violation_count": count,
                    "risk_level": "high" if count > threshold * 2 else "medium",
                    "endpoints": list(set([
                        v["endpoint"] for v in recent_violations 
                        if v["ip_address"] == ip
                    ])),
                    "violation_types": list(set([
                        v["violation_type"] for v in recent_violations 
                        if v["ip_address"] == ip
                    ]))
                }
                for ip, count in ip_counts.items()
                if count > threshold
            ]
            
            return sorted(suspicious_ips, key=lambda x: x["violation_count"], reverse=True)
            
        except Exception as e:
            logger.error(f"Failed to get suspicious activity: {e}")
            return []

    async def cleanup_old_violations(self):
        """Clean up old violation records from cache"""
        try:
            cutoff_time = datetime.utcnow() - self.cache_ttl
            self.violations_cache = [
                v for v in self.violations_cache 
                if v["timestamp"] > cutoff_time
            ]
            logger.debug(f"Cleaned up old violations, {len(self.violations_cache)} records remaining")
        except Exception as e:
            logger.error(f"Failed to cleanup old violations: {e}")

    async def _log_to_database(self, violation_record: Dict[str, Any]):
        """Log violation to database (placeholder for future implementation)"""
        # TODO: Implement database logging when rate_limit_violations table is created
        pass


class SecurityMonitor:
    """Monitor security events and threats"""
    
    def __init__(self):
        self.security_events = []
        self.max_events = 5000
        
    async def log_security_event(
        self,
        event_type: str,
        severity: str,
        description: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Log security events"""
        event = {
            "event_type": event_type,
            "severity": severity,
            "description": description,
            "user_id": user_id,
            "ip_address": ip_address,
            "timestamp": datetime.utcnow(),
            "metadata": metadata or {}
        }
        
        self.security_events.append(event)
        
        # Trim events if too many
        if len(self.security_events) > self.max_events:
            self.security_events = self.security_events[-self.max_events:]
        
        # Log based on severity
        if severity == "critical":
            logger.critical(f"Security event: {event_type} - {description}", extra=event)
        elif severity == "high":
            logger.error(f"Security event: {event_type} - {description}", extra=event)
        elif severity == "medium":
            logger.warning(f"Security event: {event_type} - {description}", extra=event)
        else:
            logger.info(f"Security event: {event_type} - {description}", extra=event)

    async def get_security_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get security events summary"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        recent_events = [
            e for e in self.security_events 
            if e["timestamp"] > cutoff_time
        ]
        
        return {
            "total_events": len(recent_events),
            "by_severity": {
                severity: len([e for e in recent_events if e["severity"] == severity])
                for severity in ["critical", "high", "medium", "low"]
            },
            "by_type": {
                event_type: len([e for e in recent_events if e["event_type"] == event_type])
                for event_type in set([e["event_type"] for e in recent_events])
            },
            "period_hours": hours
        }


# Global monitor instances
rate_limit_monitor = RateLimitMonitor()
security_monitor = SecurityMonitor()


# Background cleanup task
async def cleanup_monitoring_data():
    """Background task to cleanup old monitoring data"""
    while True:
        try:
            await rate_limit_monitor.cleanup_old_violations()
            await asyncio.sleep(3600)  # Run every hour
        except Exception as e:
            logger.error(f"Monitoring cleanup error: {e}")
            await asyncio.sleep(300)  # Retry in 5 minutes
