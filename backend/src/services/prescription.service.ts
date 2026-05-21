import prisma from '../config/prisma';

export const findAllDoctors = async () => {
  const doctors = await prisma.doctor.findMany({
    include: {
      user: {
        select: { fullName: true }
      }
    },
    orderBy: {
      user: { fullName: 'asc' }
    }
  });
  return doctors.map((d: any) => ({
    id: d.id,
    name: d.user.fullName,
    qualification: d.qualification
  }));
};

export const findPrescriptions = async (filters: {
  doctorName?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}, pagination: {
  page: number;
  limit: number;
}) => {
  const { doctorName, status, startDate, endDate, search } = filters;
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const where: any = {};
  console.log('DEBUG: Filters received:', filters);

  if (doctorName) {
    where.consultation = {
      ...where.consultation,
      appointment: {
        ...where.consultation?.appointment,
        doctor: {
          user: {
            fullName: { contains: doctorName, mode: 'insensitive' }
          }
        }
      }
    };
  }

  if (status) {
    if (status === 'Completed') {
      where.consultation = {
        ...where.consultation,
        appointment: {
          ...where.consultation?.appointment,
          status: 'Completed'
        }
      };
    } else if (status === 'Issued') {
      where.consultation = {
        ...where.consultation,
        appointment: {
          ...where.consultation?.appointment,
          status: 'Pending'
        }
      };
    } else if (status === 'Verified') {
      where.consultation = {
        ...where.consultation,
        appointment: {
          ...where.consultation?.appointment,
          status: 'Confirmed'
        }
      };
    }
  }

  // Issued Date Filter
  if (startDate || endDate) {
    where.issuedAt = {};
    if (startDate) {
      const sDate = new Date(startDate);
      if (!isNaN(sDate.getTime())) {
        where.issuedAt.gte = sDate;
      }
    }
    if (endDate) {
      const eDate = new Date(endDate);
      if (!isNaN(eDate.getTime())) {
        where.issuedAt.lte = eDate;
      }
    }
  }

  console.log('DEBUG: Final Prisma Where Clause:', JSON.stringify(where, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));

  if (search) {
    const orConditions: any[] = [
      { title: { contains: search, mode: 'insensitive' } },
      { diagnosis: { contains: search, mode: 'insensitive' } },
      { medicinesText: { contains: search, mode: 'insensitive' } },
      {
        consultation: {
          appointment: {
            patient: {
              user: {
                fullName: { contains: search, mode: 'insensitive' }
              }
            }
          }
        }
      }
    ];
    let parsedId = Number(search);
    if (search.toLowerCase().startsWith('rx-')) {
      parsedId = Number(search.slice(3));
    }
    if (!isNaN(parsedId) && parsedId > 0) {
      orConditions.push({ id: parsedId });
    }
    where.OR = orConditions;
  }

  const [prescriptions, total] = await Promise.all([
    prisma.prescription.findMany({
      where,
      skip,
      take: limit,
      include: {
        consultation: {
          include: {
            appointment: {
              include: {
                patient: {
                  include: {
                    user: {
                      select: {
                        fullName: true,
                        profilePhotoUrl: true
                      }
                    }
                  }
                },
                doctor: {
                  include: {
                    user: {
                      select: {
                        fullName: true,
                        profilePhotoUrl: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        issuedAt: 'desc'
      }
    }),
    prisma.prescription.count({ where })
  ]);

  console.log('DEBUG: Prescriptions found:', prescriptions.length);

  return {
    prescriptions,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

export const findPrescriptionById = async (id: number) => {
  return prisma.prescription.findUnique({
    where: { id },
    include: {
      consultation: {
        include: {
          appointment: {
            include: {
              patient: {
                include: {
                  user: {
                    select: {
                      fullName: true,
                      phone: true,
                      profilePhotoUrl: true
                    }
                  }
                }
              },
              doctor: {
                include: {
                  user: {
                    select: {
                      fullName: true,
                      profilePhotoUrl: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
};
