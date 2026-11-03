import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import {
  getInterviewAssignments,
  getInterviewRounds,
} from "../../services/interviewService";
import type { InterviewRound } from "../hr/Interview/interviewRound";
import type { InterviewAssignment } from "../hr/Interview/ScheduledInterview";

export const queryKeys = {
  jobs: ["jobs"],
  myApplications: ["applications", "my"],
  myInterviews: ["interviews", "my"],
  notifications: ["notifications"],
  hrAssignments: ["interviews", "hr"],
  hrCandidates: ["candidates", "hr"],
  interviewers: ["interviewers"],
  hrAnalytics: ["analytics", "hr"],
  allApplications: ["applications", "all"],
  roundDetail: (roundId: string) => ["rounds", "detail", roundId],
  roundQuestions: (roundId: string) => ["questions", roundId],
  jobRounds: (jobId: string) => ["rounds", jobId],
  myAttempts: (jobId: string) => ["attempts", jobId],
  job: (id: string) => ["jobs", id],
  assessmentResult: (attemptId: string) => ["assessmentResult", attemptId],
  jobApplications: (jobId: string) => ["applications", "job", jobId],
  application: (id: string) => ["applications", "detail", id],
  hrRounds: (jobId: string) => ["rounds", "hr", jobId],
  applicationAssessments: (id: string) => ["applications", "assessments", id],
  applicationFeedback: (id: string) => ["interviews", "feedback", id],
  //interviewer
  interviewerAssignments: ["interviews", "interviewer", "assignments"],
  interviewerInterviews: ["interviews", "interviewer", "list"],
  interviewerInterview: (id: string) => [
    "interviews",
    "interviewer",
    "detail",
    id,
  ],
  interviewerFeedback: ["interviews", "my-feedback"],
} as const;

export const getErrorMessage = (error: unknown, fallback: string): string =>
  (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message || fallback;

export const useJobs = <T = unknown>() =>
  useQuery({
    queryKey: queryKeys.jobs,
    queryFn: async () => ((await api.get("/job")).data.jobs ?? []) as T[],
    staleTime: 60_000,
  });

export const useMyApplications = <T = unknown>(options?: {
  refetchOnWindowFocus?: boolean;
}) =>
  useQuery({
    queryKey: queryKeys.myApplications,
    queryFn: async () =>
      ((await api.get("/application/my")).data.applications ?? []) as T[],
    ...options,
  });

export const useAllApplications = <T = unknown>() =>
  useQuery({
    queryKey: queryKeys.allApplications,
    queryFn: async () =>
      ((await api.get("/application")).data.applications ?? []) as T[],
  });

export const useMyInterviews = <T = unknown>() =>
  useQuery({
    queryKey: queryKeys.myInterviews,
    queryFn: async () =>
      ((await api.get("/interview-assignment/candidate/my")).data.assignments ??
        []) as T[],
  });

export const useNotifications = <T = unknown>(enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.notifications,
    enabled,
    queryFn: async () =>
      ((await api.get("/notifications")).data.notifications ?? []) as T[],
  });

export const useJobRounds = <T = unknown>(jobId: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.jobRounds(jobId),
    enabled,
    queryFn: async () =>
      ((await api.get(`/interview-round/job/${jobId}`)).data.rounds ??
        []) as T[],
  });

export const useMyAttempts = <T = unknown>(jobId: string) =>
  useQuery({
    queryKey: queryKeys.myAttempts(jobId),
    queryFn: async () =>
      ((await api.get(`/assessment/job/${jobId}/my`)).data.attempts ??
        []) as T[],
  });

export const useJob = <T = unknown>(id?: string) =>
  useQuery({
    queryKey: queryKeys.job(id ?? ""),
    enabled: !!id,
    queryFn: async () => (await api.get(`/job/${id}`)).data.job as T,
  });

// One place for "data changed, refetch it" calls.
export const useRefreshData = () => {
  const queryClient = useQueryClient();
  return {
    jobs: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["jobs"] }),
      ]);
    },
    applications: () =>
      queryClient.invalidateQueries({ queryKey: ["applications"] }),
    attempts: () => queryClient.invalidateQueries({ queryKey: ["attempts"] }),

    // hr
    interviews: () =>
      queryClient.invalidateQueries({ queryKey: ["interviews"] }),
    rounds: () => queryClient.invalidateQueries({ queryKey: ["rounds"] }),
    interviewers: () =>
      queryClient.invalidateQueries({ queryKey: ["interviewers"] }),
    candidates: () =>
      queryClient.invalidateQueries({ queryKey: ["candidates"] }),
    analytics: () => queryClient.invalidateQueries({ queryKey: ["analytics"] }),
    questions: () => queryClient.invalidateQueries({ queryKey: ["questions"] }),
  };
};

export const useAssessmentResult = <R, A>(attemptId?: string) =>
  useQuery({
    queryKey: queryKeys.assessmentResult(attemptId ?? ""),
    queryFn: async () => {
      const response = await api.get(`/assessment/${attemptId}/result`);
      return {
        result: response.data.result as R,
        answers: (response.data.answers ?? []) as A[],
      };
    },
    enabled: !!attemptId,
  });

// hr
export const useJobApplications = <T = unknown>(jobId?: string) =>
  useQuery({
    queryKey: queryKeys.jobApplications(jobId ?? ""),
    enabled: !!jobId,
    queryFn: async () =>
      ((await api.get(`/application/job/${jobId}`)).data.applications ??
        []) as T[],
  });

export const useApplication = <T = unknown>(id?: string) =>
  useQuery({
    queryKey: queryKeys.application(id ?? ""),
    enabled: !!id,
    queryFn: async () =>
      (await api.get(`/application/${id}`)).data.application as T,
  });

export const useHRRounds = (jobId?: string) =>
  useQuery({
    queryKey: queryKeys.hrRounds(jobId ?? ""),
    enabled: !!jobId,
    queryFn: async () => (await getInterviewRounds(jobId!)) as InterviewRound[],
  });

export const useHRAssignments = () =>
  useQuery({
    queryKey: queryKeys.hrAssignments,
    queryFn: async () =>
      (await getInterviewAssignments()) as InterviewAssignment[],
  });

export const useInterviewers = <T = unknown>() =>
  useQuery({
    queryKey: queryKeys.interviewers,
    queryFn: async () => {
      const response = await api.get("/hr/interviewers");
      return (response.data.interviewers || response.data.users || []) as T[];
    },
  });

export const useHRCandidates = <T = unknown>() =>
  useQuery({
    queryKey: queryKeys.hrCandidates,
    queryFn: async () =>
      ((await api.get("/hr/candidates")).data.candidates ?? []) as T[],
  });

export const useApplicationAssessments = <T = unknown>(
  applicationId: string,
  enabled = true,
) =>
  useQuery({
    queryKey: queryKeys.applicationAssessments(applicationId),
    enabled,
    queryFn: async () =>
      ((await api.get(`/application/${applicationId}/assessments`)).data
        .rounds ?? []) as T[],
  });

export const useApplicationFeedback = <T = unknown>(
  applicationId: string,
  enabled = true,
) =>
  useQuery({
    queryKey: queryKeys.applicationFeedback(applicationId),
    enabled,
    queryFn: async () =>
      ((await api.get(`/interview-feedback/application/${applicationId}`)).data
        .feedback ?? []) as T[],
  });

export const useHRAnalytics = <T = unknown>() =>
  useQuery({
    queryKey: queryKeys.hrAnalytics,
    queryFn: async () =>
      (await api.get("/hr/analytics/dashboard")).data.analytics as T,
  });

export const useRound = <T = unknown>(roundId?: string) =>
  useQuery({
    queryKey: queryKeys.roundDetail(roundId ?? ""),
    enabled: !!roundId,
    queryFn: async () =>
      (await api.get(`/interview-round/${roundId}`)).data.round as T,
  });

export const useRoundQuestions = <T = unknown>(roundId?: string) =>
  useQuery({
    queryKey: queryKeys.roundQuestions(roundId ?? ""),
    enabled: !!roundId,
    queryFn: async () =>
      ((await api.get(`/question/round/${roundId}`)).data.questions ??
        []) as T[],
  });

export const useInterviewerAssignments = <T = unknown>() =>
  useQuery({
    queryKey: queryKeys.interviewerAssignments,
    queryFn: async () =>
      ((await api.get("/interview-assignment/my")).data.assignments ??
        []) as T[],
  });

export const useInterviewerInterviews = <T = unknown>() =>
  useQuery({
    queryKey: queryKeys.interviewerInterviews,
    queryFn: async () => {
      const data = (await api.get("/interviewer/interviews")).data;
      return (data.interviews || data.assignments || []) as T[];
    },
  });

export const useInterviewerInterview = <T = unknown>(id?: string) =>
  useQuery({
    queryKey: queryKeys.interviewerInterview(id ?? ""),
    enabled: !!id,
    queryFn: async () =>
      (await api.get(`/interviewer/interviews/${id}`)).data as T,
  });

export const useInterviewerFeedback = <T = unknown>() =>
  useQuery({
    queryKey: queryKeys.interviewerFeedback,
    queryFn: async () =>
      ((await api.get("/interview-feedback/my")).data.feedback ?? []) as T[],
  });
