"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminUsersPage() {
  const [users,
    setUsers] =
    useState<any[]>(
      []
    );

  const [loading,
    setLoading] =
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
          querySnapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setUsers(
          usersData
        );

        setLoading(
          false
        );
      } catch (
        error
      ) {
        console.log(
          error
        );
      }
    };

  // Delete User
  const deleteUser =
    async (
      userId: string
    ) => {
      const ok =
        confirm(
          "Delete this user?"
        );

      if (!ok)
        return;

      try {
        await deleteDoc(
          doc(
            db,
            "users",
            userId
          )
        );

        setUsers(
          (prev) =>
            prev.filter(
              (
                user
              ) =>
                user.id !==
                userId
            )
        );
      } catch (
        error
      ) {
        console.log(
          error
        );
      }
    };

  // Make Pro
  const approvePro =
  async (
    userId: string
  ) => {
    try {

      const expiryDate =
        new Date();

      expiryDate.setMonth(
        expiryDate.getMonth() + 1
      );

      await updateDoc(
        doc(
          db,
          "users",
          userId
        ),
        {
          membership:
            "pro",

          monthlyAdLimit:
            30,

          featuredCredits:
            10,

          proApproved:
            true,

          // dates
          proStartDate:
            new Date(),

          proExpiryDate:
            expiryDate,
        }
      );

      alert(
        "User upgraded to PRO for 1 month!"
      );

      fetchUsers();

    } catch (
      error
    ) {
      console.log(
        error
      );
    }
  };
  // Remove Pro
  const removePro =
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
              "free",
            monthlyAdLimit:
              10,
            featuredCredits:
              0,
            proApproved:
              false,
          }
        );

        alert(
          "PRO removed!"
        );

        fetchUsers();
      } catch (
        error
      ) {
        console.log(
          error
        );
      }
    };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-400">
        Loading Users...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">

        <h1 className="text-2xl font-bold mb-6 sm:text-3xl">
          Users Management
        </h1>

        {/* PRO USERS */}
        <h2 className="text-3xl font-bold text-yellow-400 mb-4">
          ⭐ Pro Sellers
        </h2>

        <div className="bg-[#111827] border border-yellow-600 rounded-[30px] overflow-hidden mb-10">

          <table className="w-full">

            <thead className="bg-[#1f2937]">
              <tr>
                <th className="text-left p-5">
                  Email
                </th>

                <th className="text-left p-5">
                  Country
                </th>

                <th className="text-left p-5">
                  Phone
                </th>

       <th className="text-left p-5">
  Membership
</th>

<th className="text-left p-5">
  Expiry
</th>

<th className="text-left p-5">
  Actions
</th>
              </tr>
            </thead>

            <tbody>
              {users
                .filter(
                  (user) =>
                    user.membership ===
                    "pro"
                )
                .map(
                  (
                    user
                  ) => (
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
                        <span className="bg-yellow-500 text-black px-4 py-2 rounded-full font-bold">
                          PRO
                        </span>
                      </td>
                      <td className="p-5 text-red-400 font-semibold">
  {user.proExpiryDate
    ? new Date(
        user.proExpiryDate.seconds *
          1000
      ).toLocaleDateString(
        "en-GB"
      )
    : "No Date"}
</td>

                      <td className="p-5">
                        <button
                          onClick={() =>
                            removePro(
                              user.id
                            )
                          }
                          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl"
                        >
                          Remove Pro
                        </button>
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>

        {/* NORMAL USERS */}
        <h2 className="text-3xl font-bold text-blue-400 mb-4">
          👤 Normal Users
        </h2>

        <div className="bg-[#111827] border border-gray-800 rounded-[30px] overflow-hidden">

          <table className="w-full">

            <thead className="bg-[#1f2937]">
              <tr>
                <th className="text-left p-5">
                  Email
                </th>

                <th className="text-left p-5">
                  Country
                </th>

                <th className="text-left p-5">
                  Phone
                </th>

                <th className="text-left p-5">
                  Role
                </th>

                <th className="text-left p-5">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {users
                .filter(
                  (user) =>
                    user.membership !==
                    "pro"
                )
                .map(
                  (
                    user
                  ) => (
                    <tr
                      key={
                        user.id
                      }
                      className="border-t border-gray-800 hover:bg-[#1e293b]"
                    >
                      <td className="p-5">
                        {
                          user.email
                        }
                      </td>

                      <td className="p-5">
                        {
                          user.country ||
                          "N/A"
                        }
                      </td>

                      <td className="p-5">
                        {
                          user.phone ||
                          "N/A"
                        }
                      </td>

                      <td className="p-5">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-bold ${
                            user.role ===
                            "admin"
                              ? "bg-red-600"
                              : "bg-green-600"
                          }`}
                        >
                          {user.role ||
                            "user"}
                        </span>
                      </td>

                      <td className="p-5 flex gap-3">

                        <button
                          onClick={() =>
                            approvePro(
                              user.id
                            )
                          }
                          className="bg-yellow-500 text-black hover:bg-yellow-400 px-5 py-2 rounded-xl font-bold"
                        >
                          ⭐ Make Pro
                        </button>

                        <button
                          onClick={() =>
                            deleteUser(
                              user.id
                            )
                          }
                          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl"
                        >
                          Delete
                        </button>

                      </td>
                    </tr>
                  )
                )}
            </tbody>

          </table>
        </div>
    </div>
  );
}