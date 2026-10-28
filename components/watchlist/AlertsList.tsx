'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Trash2, Edit2, Loader2, Plus } from 'lucide-react';
import AlertModal from '@/components/alerts/AlertModal';
import { Button } from '@/components/ui/button';

export default function AlertsList({ alertData }: AlertsListProps) {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>(alertData || []);
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (alertId: string) => {
    if (deletingId) return;
    setDeletingId(alertId);

    try {
      const res = await fetch(`/api/alerts?id=${encodeURIComponent(alertId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to delete alert:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (alert: Alert) => {
    setSelectedAlert(alert);
    setActiveModal('edit');
  };

  return (
    <div className='bg-gray-800 border border-gray-600 rounded-xl p-5 flex flex-col h-full'>
      <div className='flex items-center justify-between pb-4 border-b border-gray-700 mb-4'>
        <div className='flex items-center gap-2'>
          <Bell className='h-5 w-5 text-yellow-500' />
          <h2 className='text-lg font-bold text-gray-100'>Active Price Alerts</h2>
        </div>
        <Button
          size='sm'
          variant='ghost'
          onClick={() => {
            setSelectedAlert(null);
            setActiveModal('create');
          }}
          className='text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 text-xs font-semibold'
        >
          <Plus className='h-3.5 w-3.5 mr-1' />
          Add Alert
        </Button>
      </div>

      {alerts.length === 0 ? (
        <div className='flex-1 flex flex-col items-center justify-center py-8 text-center text-gray-500'>
          <Bell className='h-10 w-10 text-gray-600 mb-2 stroke-[1.5]' />
          <p className='text-sm font-medium'>No price alerts configured</p>
          <p className='text-xs text-gray-500 mt-1 max-w-[200px]'>
            Set target price triggers to get notified of critical market moves.
          </p>
        </div>
      ) : (
        <div className='space-y-3 overflow-y-auto max-h-[460px] pr-1'>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className='p-3.5 bg-gray-700/50 border border-gray-600/70 rounded-lg hover:border-gray-500 transition-colors'
            >
              <div className='flex items-start justify-between gap-2 mb-1.5'>
                <span className='font-bold text-yellow-400 text-sm'>
                  {alert.symbol}
                </span>
                <span className='text-xs font-medium px-2 py-0.5 rounded bg-gray-600 text-gray-300'>
                  {alert.alertType === 'upper' ? '≥ Target' : '≤ Target'}
                </span>
              </div>

              <div className='flex items-center justify-between text-xs text-gray-400 mb-2'>
                <span className='line-clamp-1'>{alert.alertName}</span>
                <span className='font-bold text-gray-200'>
                  ${Number(alert.threshold).toFixed(2)}
                </span>
              </div>

              <div className='flex items-center justify-between pt-2 border-t border-gray-600/50 text-xs'>
                <span className='text-gray-400'>
                  Now: <strong className='text-gray-200'>${(alert.currentPrice || 0).toFixed(2)}</strong>
                </span>

                <div className='flex items-center gap-1'>
                  <button
                    onClick={() => handleEdit(alert)}
                    className='p-1 text-gray-400 hover:text-yellow-400 rounded transition-colors'
                    title='Edit alert'
                  >
                    <Edit2 className='h-3.5 w-3.5' />
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    disabled={deletingId === alert.id}
                    className='p-1 text-gray-400 hover:text-red-400 rounded transition-colors'
                    title='Delete alert'
                  >
                    {deletingId === alert.id ? (
                      <Loader2 className='h-3.5 w-3.5 animate-spin' />
                    ) : (
                      <Trash2 className='h-3.5 w-3.5' />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeModal && (
        <AlertModal
          open={Boolean(activeModal)}
          setOpen={(o) => !o && setActiveModal(null)}
          action={activeModal}
          alertId={selectedAlert?.id}
          alertData={
            selectedAlert
              ? {
                  symbol: selectedAlert.symbol,
                  company: selectedAlert.company,
                  alertName: selectedAlert.alertName,
                  alertType: selectedAlert.alertType,
                  threshold: String(selectedAlert.threshold),
                }
              : undefined
          }
          onSuccess={() => {
            router.refresh();
            setActiveModal(null);
          }}
        />
      )}
    </div>
  );
}
