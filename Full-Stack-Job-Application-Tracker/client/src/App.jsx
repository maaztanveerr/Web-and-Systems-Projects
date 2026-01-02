import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // jobs will start as null meaning we haven't loaded yet
  const [jobs, setJobs] = useState(null)

  // each piece of the form has its own state variable
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [status, setStatus] = useState('Applied') // default option
  const [appliedOn, setAppliedOn] = useState('')
  const [notes, setNotes] = useState('')

  const [formError, setFormError] = useState('') // state for form error message

  // state for editing an existing job's status and notes
  const [editingJobId, setEditingJobId] = useState(null)
  const [editStatus, setEditStatus] = useState('Applied')
  const [editNotes, setEditNotes] = useState('')
  const [editError, setEditError] = useState('')

  // state for deleting a job (confirmation and errors)
  const [deletingJobId, setDeletingJobId] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  //fetching jobs from backend function
  function fetchJobs() {
    fetch('http://localhost:3000/jobs')
      .then((res) => res.json())
      .then((data) => {
        // data is the array returned by GET /jobs
        setJobs(data)
      })
      .catch((error) => {
        console.error('Error in fetching jobs: ', error)
        // if something goes wrong, treat as no jobs
        setJobs([])
      })
  }

  // load jobs once when the component first shows up
  useEffect(() => {
    fetchJobs()
  }, [])

  // function to submit add job form
  function handleAddJob() {
    // clear any old error first
    setFormError('')

    // basic field check
    if (!company || !position || !status || !appliedOn) {
      setFormError('Please fill in Company, Position, Status, and Date Applied.')
      return
    }

    // build the object to send to the backend
    const newJobData = {
      company: company,
      position: position,
      status: status,
      applied_on: appliedOn,
      notes: notes,
    }

    //make the post request
    fetch('http://localhost:3000/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newJobData),
    })
      .then((res) => res.json())
      .then(() => {
        // re-fetch the whole list from the server
        fetchJobs()

        // clear inputs
        setCompany('')
        setPosition('')
        setStatus('Applied')
        setAppliedOn('')
        setNotes('')

        // clear error if there was one
        setFormError('')
      })
      .catch((error) => { // in case of error
        console.error('Error adding job:', error)
        setFormError('There was a problem adding the job. Please try again.')
      })
  }

  // start editing a specific job by filling the edit fields with its current values
  function startEditJob(job) {
    setEditingJobId(job.id)
    setEditStatus(job.status)
    setEditNotes(job.notes || '')
    setEditError('')
  }

  // stop editing and reset the edit fields
  function cancelEdit() {
    setEditingJobId(null)
    setEditStatus('Applied')
    setEditNotes('')
    setEditError('')
  }

  // send the updated status/notes to the backend
  function handleUpdateJob() {
    // if for some reason nothing is selected, do nothing
    if (!editingJobId) {
      return
    }

    setEditError('')

    //body
    const updateData = {
      status: editStatus,
      notes: editNotes,
    }

    fetch('http://localhost:3000/jobs/' + editingJobId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })
      .then((res) => res.json())
      .then(() => {
        // refresh list so we see the updated job
        fetchJobs()
        // exit edit mode
        cancelEdit()
      })
      .catch((error) => {
        console.error('Error updating job:', error)
        setEditError('There was a problem updating the job')
      })
  }

  // start delete flow for a specific job
  function startDeleteJob(jobId) {
    setDeletingJobId(jobId)
    setDeleteError('')
  }

  // cancel delete and reset state
  function cancelDeleteJob() {
    setDeletingJobId(null)
    setDeleteError('')
  }

  // actually delete the job on the backend
  function handleDeleteJob() {
    if (!deletingJobId) {
      return
    }

    setDeleteError('')

    fetch('http://localhost:3000/jobs/' + deletingJobId, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then(() => {
        // refresh list so we see it gone
        fetchJobs()
        cancelDeleteJob() // clear
      })
      .catch((error) => {
        console.error('Error deleting job:', error)
        setDeleteError('There was a problem deleting the job.')
      })
  }

  // for the form error message 
  let formErrorElement = null
  if (formError) {
    formErrorElement = (
      <p style={{ color: 'red' }}>{formError}</p>
    )
  }

  // getting the color for different situations
  function getStatusColor(jobStatus) {
    if (jobStatus === 'Applied') {
      return 'blue'
    } else if (jobStatus === 'Interviewing') {
      return 'orange'
    } else if (jobStatus === 'Offer') {
      return 'green'
    } else if (jobStatus === 'Reject') {
      return 'red'
    } else {
      return 'black'
    }
  }

  return (
    <div>
      <h1>Job Application Tracker</h1>

      {/* add job section */}
      <div
        style={{
          border: '1px solid lightgray',
          padding: '1rem',
          marginBottom: '2rem',
          textAlign: 'left',
        }}
      >
        <h2>Add New Job</h2>

        {/* show a red error message above the form when something is wrong */}
        {formErrorElement}

        {/* company name input */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Company:{' '}
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>
        </div>

        {/* position title input */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Position:{' '}
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </label>
        </div>

        {/* status dropdown with the main four options */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Status:{' '}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer">Offer</option>
              <option value="Reject">Reject</option>
            </select>
          </label>
        </div>

        {/* date applied uses the browser's date picker */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Date Applied:{' '}
            <input
              type="date"
              value={appliedOn}
              onChange={(e) => setAppliedOn(e.target.value)}
            />
          </label>
        </div>

        {/* optional notes field for extra details */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Notes (optional):{' '}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              cols={30}
            />
          </label>
        </div>

        {/* clicking this sends the data to the backend via handleAddJob */}
        <button onClick={handleAddJob}>
          Add Job
        </button>
      </div>

        {/* using && here means that if condition true, react will render JSX ptherwise ignore it */}

      {/* first case we are waiting for the fetch */} 
      {jobs === null && <p>Loading jobs...</p>} {/*only shows loading jobs while jobs still null*/}

      {/* second case we got an empty array back */}
      {jobs !== null && jobs.length === 0 && <p>No jobs yet. Try adding one.</p>}

      {/* third case we have at least one job */}
      {jobs !== null && jobs.length > 0 && (
        <ul>
          {jobs.map((job) => {

            // decide what to show for delete either Delete button or confirm check
            let deleteSection = null

            if (deletingJobId === job.id) {
              // error check
              let deleteErrorElement = null
              if (deleteError) {
                deleteErrorElement = (
                  <p style={{ color: 'red' }}>{deleteError}</p>
                )
              }

              deleteSection = (
                <div style={{ marginTop: '0.5rem' }}>
                  {deleteErrorElement}
                  <p>Are you sure you want to delete this job?</p>
                  <button onClick={handleDeleteJob}>
                    Yes, delete
                  </button>{' '}
                  <button onClick={cancelDeleteJob}>
                    No, keep it
                  </button>
                </div>
              )
            } else {
              deleteSection = (
                <button onClick={() => startDeleteJob(job.id)}>
                  Delete
                </button>
              )
            }

            // decide what to show under each job meaning either Edit button or the edit form
            let editSection = null

            if (editingJobId === job.id) {
              //  error check
              let editErrorElement = null
              if (editError) {
                editErrorElement = (
                  <p style={{ color: 'red' }}>{editError}</p>
                )
              }

              // if this is the job we are editing, show inputs and Save / Cancel
              editSection = (
                <div style={{ marginTop: '0.5rem' }}>
                  {editErrorElement}

                  <div style={{ marginBottom: '0.5rem' }}>
                    <label>
                      New Status:{' '}
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offer">Offer</option>
                        <option value="Reject">Reject</option>
                      </select>
                    </label>
                  </div>

                  <div style={{ marginBottom: '0.5rem' }}>
                    <label>
                      New Notes:{' '}
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={2}
                        cols={30}
                      />
                    </label>
                  </div>

                  <button onClick={handleUpdateJob}>
                    Save Changes
                  </button>{' '}
                  <button onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              )
            } else {
              // if we are not editing this job, just show a simple edit button
              editSection = (
                <button onClick={() => startEditJob(job)}>
                  Edit
                </button>
              )
            }

            return (
              <li
                key={job.id}
                style={{
                  border: '1px solid lightgray',
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  textAlign: 'left',
                }}
              >
                {/* company name in bold, position next to it */}
                <b>{job.company}</b> - {job.position}
                {/* status and applied date on their own lines */}
                <div style={{ color: getStatusColor(job.status) }}>
                  Status: {job.status}
                </div>
                <div>Applied on: {job.applied_on}</div>
                {/* only show notes if there is something there */}
                {job.notes && <div>Notes: {job.notes}</div>}

                {/* either the edit button or the edit form, decided above */}
                {editSection}

                {/* either the delete button or the delete confirmation */}
                {deleteSection}
              </li>
            )
          })}
        </ul>
      )}

    </div>
  )

}

export default App;
