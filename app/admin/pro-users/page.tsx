"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function ProUsersPage() {
  const [users, setUsers] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers =
    async () => {
      try {
        const querySnapshot =
          await getDocs(
            collection(
              db,
              "users"
            )
          );

        const usersData =
          querySnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter(
              (user: any) =>
                user.proRequest ===
                true
            );

        setUsers(
          usersData
        );

        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

  const approveProUser =
    async (
      userId: string
    ) => {
      try {
        await updateDoc(
          doc(
            db,
            "users",
            userId
          ),
          {
            membership:
              "pro",

            proApproved:
              true,

            proRequest:
              false,

            verifiedSeller:
              true,

            monthlyAdLimit:
              30,

            featuredCredits:
              10,
          }
        );

        alert(
          "User upgraded to PRO!"
        );

        fetchUsers();
      } catch (error) {
        console.log(error);
      }
    };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-400">
        Loading Pro Requests...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">

        <h1 className="mb-6 text-2xl font-bold text-[#FBB03B] sm:text-3xl">
          Pro Seller Requests
        </h1>

        <div className="bg-[#111827] rounded-3xl overflow-hidden border border-yellow-500/20">

          <table className="w-full">

            <thead className="bg-[#0f172a]">
              <tr>
                <th className="p-5 text-left">
                  Email
                </th>

                <th className="p-5 text-left">
                  Country
                </th>

                <th className="p-5 text-left">
                  Phone
                </th>

                <th className="p-5 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {users.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-10 text-center text-gray-400"
                  >
                    No pending
                    requests
                  </td>
                </tr>
              ) : (
                users.map(
                  (user) => (
                    <tr
                      key={
                        user.id
                      }
                      className="border-t border-gray-800"
                    >
                      <td className="p-5">
                        {
                          user.email
                        }
                      </td>

                      <td className="p-5">
                        {
                          user.country
                        }
                      </td>

                      <td className="p-5">
                        {
                          user.phone
                        }
                      </td>

                      <td className="p-5">

                        <button
                          onClick={() =>
                            approveProUser(
                              user.id
                            )
                          }
                          className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-bold"
                        >
                          ✅ Approve
                        </button>

                      </td>
                    </tr>
                  )
                )
              )}

            </tbody>
          </table>
        </div>
    </div>
  );
}
