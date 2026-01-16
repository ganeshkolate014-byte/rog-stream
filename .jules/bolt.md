## 2024-05-22 - [Missing default staleTime in custom hooks]
**Learning:** The custom `useApi` hook wraps React Query but didn't set a default `staleTime`. This causes the library to treat all data as immediately stale, leading to aggressive refetching on window focus or component remounts.
**Action:** When auditing React Query usage, always check if `staleTime` is configured globally or in custom hooks.
