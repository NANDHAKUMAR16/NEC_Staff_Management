import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from 'react';
import { MonthDays, Weak } from "../template";
import { useUserLeaveMutation } from "../../../../../apis/Apis";

interface CalendarProps {
  year: number;
  month: number;
}

interface LeaveInfo {
  date: number;
  month: number;
  year: number;
  reason: string;
  _id: string;
  reasonType:string;
  session:String
}

const Calendar: React.FC<CalendarProps> = ({ year, month }) => {
  const [userLeaveMutation, { data, error, isLoading }] =
    useUserLeaveMutation();
  const [userLeave, setUserLeave] = useState<LeaveInfo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await userLeaveMutation({ year, month });
        console.log(result);
        if (result && 'data' in result && 'data' in result.data) {
          setUserLeave(Array.isArray(result.data.data) ? result.data.data : [result.data.data]);
        }
        else {
          setUserLeave([]);
        }
      } catch (error) {
        console.error("Error fetching user leave details:", error);
      }
    };
    fetchData();
  }, [userLeaveMutation, year, month]);

  const getUserLeaveType = (day: number): number => {
    const leaveInfo = userLeave.find((leave) => leave.date === day);
    if (leaveInfo) {
      switch (leaveInfo.session) {
        case "AN":
          return -1;
        case "FN":
          return -2;
        case "Day":
          return -3;
        default:
          return -4;
      }
    }

    return day;
  };

  const dateString = `${year}-${month}-01`;
  const dateObject = new Date(dateString);
  const dayOfWeek = dateObject.toLocaleDateString('en-US', { weekday: 'long' });
  const nildays = Weak(dayOfWeek) || 0;
  const daysInMonth = MonthDays(month, year) || 0;
  const calendarDays = [];

  for (let i = 0; i < nildays; i++) {
    calendarDays.push(0);
  }

  if (userLeave.length === 0) {
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }
  } else {
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(getUserLeaveType(i));
    }
  }

  const rows: number[][] = [];
  let currentRow: number[] = [];

  for (let i = 0; i < calendarDays.length; i++) {
    currentRow.push(calendarDays[i]);
    if (currentRow.length === 7 || i === calendarDays.length - 1) {
      rows.push([...currentRow]);
      currentRow = [];
    }
  }

  const isSmallScreen = useMediaQuery('(max-width:600px)');

  return (
    <TableContainer component={Paper} sx={{ maxWidth: isSmallScreen ? '80%' : '80%', margin: 'auto', border: '1px solid black' }}>
      <Table>
        <TableHead sx={{backgroundColor:"#3a86ff", color:"whitesmoke",fontSize:'80%'}}>
          <TableRow>
            <TableCell align="center" sx={{ color: 'white'}}>Sun</TableCell>
            <TableCell align="center" sx={{ color: 'white' }}>Mon</TableCell>
            <TableCell align="center" sx={{ color: 'white' }}>Tue</TableCell>
            <TableCell align="center" sx={{ color: 'white' }}>Wed</TableCell>
            <TableCell align="center" sx={{ color: 'white' }}>Thu</TableCell>
            <TableCell align="center" sx={{ color: 'white' }}>Fri</TableCell>
            <TableCell align="center" sx={{ color: 'white' }}>Sat</TableCell>
          </TableRow>
        </TableHead>
        <TableBody >
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} >
              {row.map((day, dayIndex) => (
                <TableCell key={dayIndex} align="center" sx={{ color: day < 0 || dayIndex % 7 === 0 ? '#FF004D' : 'black', fontWeight: day < 0 ? 'bold' : 'normal' }}>
                {day !== 0 ? 
                  (day === -1 ? 'AN' :
                    (day === -2 ? 'FN' :
                      (day === -3 ? 'DAY' : day)
                    )
                  )
                : ''}
              </TableCell>                
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default Calendar;
