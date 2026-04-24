import pb from '@/lib/pocketbase/client'

export const getMovideskJiraConfig = () =>
  pb.send('/backend/v1/config/movidesk-jira', { method: 'GET' })

export const saveMovideskJiraConfig = (data: any) =>
  pb.send('/backend/v1/config/movidesk-jira', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const testMovideskConnection = (data: { url: string; token: string }) =>
  pb.send('/backend/v1/test/movidesk', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const testJiraConnection = (data: { url: string; token: string }) =>
  pb.send('/backend/v1/test/jira', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
