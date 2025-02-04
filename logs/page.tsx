'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from '@/components/ui/use-toast';

type Log = {
  id: number;
  created_at: string;
  event_type: string;
  details: string;
  user_id: string;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: 'destructive',
          description: 'Failed to fetch logs',
        });
        return;
      }

      setLogs(data || []);
    };

    fetchLogs();
  }, [supabase]);

  return (
    <div className="max-w-6xl w-full m-4 sm:m-10">
      <h1 className="text-2xl font-bold mb-6">System Logs</h1>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.event_type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-500">No logs found</div>
        )}
      </div>
    </div>
  );
} 