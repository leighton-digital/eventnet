import { Card, CardBody, Typography } from "@material-tailwind/react";

export function EmptyCard() {
  return (
    <Card className="w-96 h-60 border" color="white" shadow={true}>
      <CardBody className="p-10">
        <Typography
          variant="h5"
          color="gray"
          className="mb-2 content-center text-gray-400 text-center"
        >
          You don&apos;t have any saved Events
        </Typography>
      </CardBody>
    </Card>
    // <div className="content-center h-60 grid shrink-0 max-w-md p-8 m-2 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    //   <h2 className="text-gray-400">You don&apos;t have any saved Events</h2>
    // </div>
  );
}
