/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useContext, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, User, UserRoundCheck } from 'lucide-react'
import { ModalContext } from '@/context/ModalContext'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

// Define the User interface based on your backend response
interface SearchedUser {
  id: number;
  name: string;
  email: string;
  username: string;
  profilePicture: string;
  friendRequestSent: boolean;
  createdAt: string;
}

// Fetch API data for users
const fetchUsers = async (searchQuery: string, page: number, limit: number) => {
  const payload = {
    search: searchQuery,
    page: page,
    limit: limit,
    sortBy: "name", // Sorting by name, can be adjusted
    sortOrder: "desc", // or "desc" for descending order
  };

  const response = await fetch('/api/users/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}

export default function PeopleSearchModal() {
  const {
    searchUserModalIsOpen,
    searchUserModalChange,
  } = useContext(ModalContext);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [buttonIsLoading, setButtonIsLoading] = useState(false);
  const resultsPerPage = 5;

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 when search query changes
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
  };

  // Reset state when the modal closes
  const handleModalClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchQuery('');
      setCurrentPage(1);
      setUsers([]);
    }
    searchUserModalChange(isOpen);
  };
  const sendFriendRequest = async (userId: number) => {
    try {
      setButtonIsLoading(true);
      const response = await fetch('/api/friend/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send friend request');
      }

      // You might want to update the UI or show a success message here
      toast({
        title: "Sent Friend Request"
      });
      setUsers((prevUserState) => {
        const index = prevUserState.findIndex((user) => user.id == userId);
        prevUserState[index].friendRequestSent = true;
        return prevUserState;
      })
    } catch (error: any) {
      toast({
        title: "Failed Sending Friend Request",
        variant: "destructive"
      })
    }
    setButtonIsLoading(false);
  };
  useEffect(() => {
    const fetchData = async () => {
      if (!searchQuery && currentPage === 1) return; // Don't fetch on initial empty state
      setLoading(true);
      try {
        const data = await fetchUsers(searchQuery, currentPage, resultsPerPage);
        setUsers(data.data);
        setTotalPages(data.meta.totalPages);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, currentPage]);

  return (
    <Dialog open={searchUserModalIsOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-[500px] text-black dark:text-white">
        <DialogHeader>
          <DialogTitle>Search People</DialogTitle>
          <DialogDescription>
            Find people by their name or username.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative px-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-9"
            />
          </div>
          <div className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : (
              users.map(person => (
                <div onClick={() => {
                  handleModalClose(false);
                  router.push(`/profile/${person.id}`)
                }} key={person.id} className="flex items-center justify-between dark:hover:bg-gray-700 transtion transition-all p-2 rounded-lg ">
                  <div className='flex space-x-4 '>
                    <Avatar>
                      <AvatarImage src={person.profilePicture || '/placeholder.svg'} alt={person.name} />
                      <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-black dark:text-white font-medium leading-none">{person.name}</p>
                      <p className="text-sm text-black dark:text-white text-muted-foreground">  {person.email}</p>
                    </div>
                  </div>
                  {person.friendRequestSent ? <UserRoundCheck /> : <Button
                    disabled={buttonIsLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      sendFriendRequest(person.id)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Send Friend Request
                  </Button>}
                </div>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="overflow-x-auto px-1 pb-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(1)}
                      isActive={currentPage === 1}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {currentPage > 3 && <PaginationEllipsis />}
                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(currentPage - 1)}>
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  {currentPage !== 1 && currentPage !== totalPages && (
                    <PaginationItem>
                      <PaginationLink isActive>{currentPage}</PaginationLink>
                    </PaginationItem>
                  )}
                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(currentPage + 1)}>
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  {currentPage < totalPages - 2 && <PaginationEllipsis />}
                  {totalPages > 1 && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(totalPages)}
                        isActive={currentPage === totalPages}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
