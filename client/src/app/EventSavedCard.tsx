import { copyToClipBoard } from "./copyToClipBoard";

import { Card, CardBody } from "@material-tailwind/react";

import {
  XMarkIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
  ClipboardIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  LinkIcon,
} from "@heroicons/react/20/solid";

//@ts-ignore
export function EventSavedCard({ eventEnvelope, handleClick, handleSave }) {
  return (
    <Card
      className="min-w-96 border mr-4 flex shrink-0 max-w-md"
      color="white"
      shadow={true}
    >
      <div className="pt-4 pl-4">
        <button
          onClick={(event) => copyToClipBoard(eventEnvelope)}
          type="button"
          className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
        >
          <ClipboardIcon className="h-5 w-5 text-white-500 px-0 py-0 mr-1" />
          Copy
        </button>
        <button
          onClick={(event) => handleSave(eventEnvelope.id)}
          type="button"
          className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
        >
          <BookmarkSlashIcon className="h-5 w-5 text-white-500 px-0 py-0 mr-1" />
          Remove
        </button>

        <button
          onClick={(event) => handleClick(eventEnvelope.id)}
          type="button"
          className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-white-500 px-0 py-0 mr-1" />
          Inspect
        </button>
      </div>
      <CardBody>
        <div>
          <form>
            <div className="mb-6">
              <label
                htmlFor="source"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Event Source
              </label>
              <input
                type="text"
                id="source"
                disabled={true}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={eventEnvelope.source}
              ></input>
            </div>
            <div className="mb-6">
              <label
                htmlFor="detailtype"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Event Detail Type
              </label>
              <input
                type="text"
                id="detailtype"
                disabled={true}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={eventEnvelope["detail-type"]}
              ></input>
            </div>

            <div className="inspect-bar"></div>
          </form>
        </div>
      </CardBody>
    </Card>
  );
}
