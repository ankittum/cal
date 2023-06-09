import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";

import dayjs from "@calcom/dayjs";
import { CAL_URL } from "@calcom/lib/constants";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import type { ITimezone } from "@calcom/ui";
import { Avatar, DatePickerField as DatePicker, Select, TimezoneSelect } from "@calcom/ui";

import TeamAvailabilityTimes from "./TeamAvailabilityTimes";

interface Props {
  team?: RouterOutputs["viewer"]["teams"]["get"];
}

export default function TeamAvailabilityScreen(props: Props) {
  const utils = trpc.useContext();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTimeZone, setSelectedTimeZone] = useState<ITimezone>(
    localStorage.getItem("timeOption.preferredTimeZone") || dayjs.tz.guess()
  );
  const [frequency, setFrequency] = useState<15 | 30 | 60>(30);

  useEffect(() => {
    utils.viewer.teams.getMemberAvailability.invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimeZone, selectedDate]);

  const Item = ({ index, style }: { index: number; style: CSSProperties }) => {
    const member = props.team?.members?.[index];
    if (!member) return <></>;

    return (
      <div key={member.id} style={style} className="flex border-r border-subtle pl-4 ">
        <TeamAvailabilityTimes
          teamId={props.team?.id as number}
          memberId={member.id}
          frequency={frequency}
          selectedDate={selectedDate}
          selectedTimeZone={selectedTimeZone}
          HeaderComponent={
            <div className="mb-6 flex items-center">
              <Avatar
                size="sm"
                imageSrc={CAL_URL + "/" + member.username + "/avatar.png"}
                alt={member?.name || ""}
                className="min-w-10 min-h-10 mt-1 h-10 w-10 rounded-full"
              />
              <div className="inline-block overflow-hidden pt-1 ltr:ml-3 rtl:mr-3">
                <span className="text-default truncate text-lg font-bold">{member?.name}</span>
                <span className="text-muted -mt-1 block truncate text-sm">{member?.email}</span>
              </div>
            </div>
          }
        />
      </div>
    );
  };

  return (
    <div className="bg-default flex flex-1 flex-col rounded-sm border border-neutral-200">
      <div className="flex w-full space-x-5 border-b border-subtle p-4 rtl:space-x-reverse">
        <div className="flex flex-col">
          <span className="text-default text-sm font-medium">Date</span>
          <DatePicker
            date={selectedDate.toDate()}
            className="p-1.5"
            onDatesChange={(newDate) => {
              setSelectedDate(dayjs(newDate));
            }}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-default text-sm font-medium">Timezone</span>
          <TimezoneSelect
            id="timeZone"
            value={selectedTimeZone}
            onChange={(timezone) => setSelectedTimeZone(timezone.value)}
            classNamePrefix="react-select"
            className="react-select-container border-default w-full rounded-sm border text-sm"
          />
        </div>
        <div className="hidden sm:block">
          <span className="text-default text-sm font-medium">Slot Length</span>
          <Select
            options={[
              { value: 15, label: "15 minutes" },
              { value: 30, label: "30 minutes" },
              { value: 60, label: "60 minutes" },
            ]}
            isSearchable={false}
            className="border-default block w-full min-w-0 flex-1 rounded-sm border text-sm"
            value={{ value: frequency, label: `${frequency} minutes` }}
            onChange={(newFrequency) => setFrequency(newFrequency?.value ?? 30)}
          />
        </div>
      </div>
      <div className="flex h-full flex-1">
        <AutoSizer>
          {({ height, width }) => (
            <List
              itemSize={240}
              itemCount={props.team?.members?.length ?? 0}
              className="List"
              height={height}
              layout="horizontal"
              width={width}>
              {Item}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  );
}
