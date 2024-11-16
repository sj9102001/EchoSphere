'use client'

import { useState } from 'react'
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
import { Search, User } from 'lucide-react'

interface SearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

// Mock data for demonstration
const allPeople = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  username: `user${i + 1}`,
  avatar: `/placeholder.svg?height=40&width=40`
}))

export default function PeopleSearchModal({ open, onOpenChange }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const resultsPerPage = 5

  const filteredPeople = allPeople.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPeople.length / resultsPerPage)
  const currentResults = filteredPeople.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            {currentResults.map(person => (
              <div key={person.id} className="flex items-center dark:hover:bg-gray-700   transtion transition-all p-2 rounded-lg space-x-4">
                <Avatar>
                  <AvatarImage src={person.avatar} alt={person.name} />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm \ text-black dark:text-white font-medium leading-none">{person.name}</p>
                  <p className="text-sm text-black dark:text-white text-muted-foreground">@{person.username}</p>
                </div>
              </div>
            ))}
          </div>
          {filteredPeople.length > resultsPerPage && (
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
  )
}