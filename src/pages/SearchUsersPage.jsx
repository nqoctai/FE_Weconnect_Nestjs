import UserCard from "@components/UserCard";
import { useSearchUsers } from "@hooks/apiHook";

import React from "react";
import { useLocation } from "react-router-dom";

const SearchUsersPage = () => {
  const location = useLocation();

  const { data } = useSearchUsers({
    filter: location?.state?.searchTerm,
    page: 1,
    size: 20,
  });

  console.log("data >>>", data);

  return (
    <div className="container flex-col">
      <p className="text-xl font-bold">Search</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(data?.data?.result || []).map((user) => (
          <UserCard
            id={user.id}
            key={user.id}
            fullName={user.name}
            isFriend={user.friend}
            requestSent={user.requestSent}
            requestReceived={user.requestReceived}
            friendRequestId={user.friendsId}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchUsersPage;
