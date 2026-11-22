"""Read-only recovery metrics. Run manually; never sends mail or schedules work."""
import json
from send_recovery_campaign import connect

with connect() as conn, conn.cursor() as cursor:
    cursor.execute('''SELECT
        COUNT(*) AS invitations,
        SUM(send_status IN ('accepted','bounced')) AS smtp_accepted,
        SUM(send_status = 'bounced') AS confirmed_hard_bounces,
        SUM(send_status = 'refused') AS smtp_refused,
        SUM(send_status IN ('sending','unknown')) AS uncertain_sends,
        SUM(send_status = 'prepared') AS pending,
        SUM(activated_at IS NOT NULL) AS activated_via_recovery,
        SUM(checkout_session_id IS NOT NULL) AS accounts_opening_discount_checkout,
        SUM(used_at IS NOT NULL) AS accounts_with_discount_purchase,
        SUM(unsubscribed_at IS NOT NULL) AS unsubscribed
        FROM recovery_invitations_photoshotai WHERE campaign = %s''', ('recovery_20261122',))
    print(json.dumps({key: int(value or 0) for key, value in cursor.fetchone().items()}, indent=2))
