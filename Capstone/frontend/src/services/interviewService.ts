import api from "./api";

// INTERVIEW ROUNDS
export const getInterviewRounds = async (jobId: string) => {
  const response = await api.get(`/interview-round/job/${jobId}`);

  return response.data.rounds || [];
};

export const createInterviewRound = async (
  jobId: string,
  data: {
    roundNumber: number;
    title: string;
    type: string;
    description?: string;
    durationMinutes?: number;
    passingScore?: number;
    isActive?: boolean;
  },
) => {
  const response = await api.post(`/interview-round/job/${jobId}`, data);

  return response.data;
};

export const updateInterviewRound = async (
  roundId: string,
  data: {
    roundNumber?: number;
    title?: string;
    type?: string;
    description?: string;
    durationMinutes?: number;
    passingScore?: number;
    isActive?: boolean;
  },
) => {
  const response = await api.put(`/interview-round/${roundId}`, data);

  return response.data;
};

export const deleteInterviewRound = async (roundId: string) => {
  const response = await api.delete(`/interview-round/${roundId}`);

  return response.data;
};

//assignments
export const getInterviewAssignments = async () => {
  const response = await api.get("/interview-assignment");

  return response.data.assignments || [];
};

export const createInterviewAssignment = async (
  applicationId: string,
  roundId: string,
  data: {
    interviewerId: string;
    scheduledAt: string;
    location: string;
    endsAt: string;
  },
) => {
  const response = await api.post(
    `/interview-assignment/application/${applicationId}/round/${roundId}`,
    data,
  );

  return response.data;
};

export const updateInterviewAssignment = async (
  assignmentId: string,
  data: {
    interviewerId?: string;
    scheduledAt?: string;
    location?: string;
    status?: string;
    endsAt?: string;
  },
) => {
  const response = await api.patch(
    `/interview-assignment/${assignmentId}`,
    data,
  );

  return response.data;
};
