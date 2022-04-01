import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import Modal from 'react-modal'

import './App.css'

Modal.setAppElement(document.getElementById('yourAppElement'))

function App () {
  const [modalIsOpen, setIsOpen] = useState(false)
  const [modalContent, setModalContent] = useState(null)
  const [modalMeta, setModalMeta] = useState(null)
  const [message, setMessage] = useState(null)
  const [saved, setSaved] = useState(null)

  function openModal () {
    setIsOpen(true)
  }

  function closeModal () {
    setIsOpen(false)
  }

  const saveMessage = data => {
    closeModal()
    if (saved) {
      let oldData = saved
      oldData.nodes.push(modalContent)
      oldData.message.push({ [modalContent.id]: message })
      localStorage.setItem('careAR', JSON.stringify(oldData))
    } else {
      localStorage.setItem('careAR', data)
    }
  }

  const deleteData = id => {
    console.log('deleting...')
    let data = saved
    saved.nodes.forEach((e, i) => {
      if (e.id == id) {
        data.nodes.splice(i, 1)
      }
    })
    saved.message.forEach((e, i) => {
      if (e.id == id) {
        data.message.splice(i, 1)
      }
    })
    localStorage.setItem('careAR', JSON.stringify(data))
    setSaved(data)
    window.location.reload()
  }

  useEffect(() => {
    let storage = localStorage.getItem('careAR')
    if (localStorage.getItem('careAR')) {
      setSaved(JSON.parse(storage))
      console.log(JSON.parse(storage))
    }
    window
      .threekitPlayer({
        authToken: 'AUTH_TOKEN',
        el: document.getElementById('player'),
        assetId: '8cbefea0-9fde-4e91-a5b0-126374bb58cb',
        showConfigurator: false
      })
      .then(function (player) {
        window.player = player
        player.tools.addTool({
          key: 'partSelect',
          label: 'Part Select Tool',
          active: true,
          enabled: true,
          handlers: {
            click: ev => {
              const hits = ev.hitNodes
              const nodeId = hits && hits.length > 0 && hits[0].nodeId
              if (nodeId) {
                const selectable = player.scene.get({
                  id: nodeId,
                  plug: 'Properties',
                  property: 'selectable'
                })
                if (selectable || typeof selectable === 'undefined') {
                  player.selectionSet.set(nodeId)
                  const nodeInfo = player.scene.get({ id: nodeId })
                  setModalContent(nodeInfo)
                  nodeInfo.plugs.Properties.forEach(e => {
                    if (e.name == 'MetaData') {
                      let obj = { [e.key]: e.value }
                      setModalMeta(obj)
                      return JSON.stringify(obj)
                    } else {
                      setModalMeta(null)
                    }
                  })
                  openModal()
                } else {
                  player.selectionSet.clear()
                }
              } else {
                player.selectionSet.clear()
              }
            }
          }
        })
      })
  }, [])
  return (
    <div>
      <div id='player' style={{ height: '500px' }}></div>

      <div id='yourAppElement'>
        <Modal
          isOpen={modalIsOpen}
          // onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          contentLabel='Example Modal'
        >
          {modalContent ? (
            <div>
              <h1>{modalContent.name}</h1>
              <ul>
                <li>
                  <b>ID:</b> {modalContent.id}
                </li>
                <li>
                  <b>Parent Node:</b> {modalContent.parent}
                </li>
                <li>
                  <b>Metadata:</b>{' '}
                  {modalMeta
                    ? JSON.stringify(modalMeta)
                    : 'No Metadata for this part'}
                </li>
              </ul>
              {window.location.pathname == '/auth' ? (
                <div>
                  <textarea
                    id='notes'
                    name='notes'
                    rows='5'
                    cols='33'
                    onChange={e => setMessage(e.target.value)}
                  >
                    Enter your notes here...
                  </textarea>
                  <button
                    id='save'
                    onClick={() =>
                      saveMessage(
                        JSON.stringify({
                          nodes: [modalContent],
                          message: [{ [modalContent.id]: message }]
                        })
                      )
                    }
                  >
                    Save Notes
                  </button>
                </div>
              ) : null}

              <button onClick={closeModal}>close</button>
            </div>
          ) : null}
        </Modal>
      </div>
      {window.location.pathname == '/view' ? (
        <div>
          {saved ? (
            <div style={{ margin: '10px' }}>
              <h3>Work Items</h3>
              {saved.nodes.map(e => {
                return (
                  <details>
                    <summary>{e.name}</summary>
                    <p>
                      <b>Message: </b>
                      {saved.message.map(f => {
                        if (f[e.id]) {
                          return <span>{f[e.id]}</span>
                        }
                      })}
                    </p>
                    <p>{JSON.stringify(e)}</p>
                    <button onClick={() => deleteData(e.id)}>
                      Delete {e.name}
                    </button>
                  </details>
                )
              })}
              {/* {Object.values(saved.message).map(e=> { return <p>{e}</p>})} */}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default App
