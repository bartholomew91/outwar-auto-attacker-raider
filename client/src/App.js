import React, { Component } from 'react'
import openSocket from 'socket.io-client';
import './App.css'
import { 
    Container,
    Tabs,
    TabList,
    Tab,
    TabLink,
    Navbar,
    NavbarBrand,
    NavbarItem,
    Panel,
    PanelHeading,
    PanelBlock,
    Columns,
    Column,
    Field,
    Control,
    Button,
    Label,
    Input,
    NavbarEnd,
    Progress,
    Modal,
    ModalBackground,
    ModalCard,
    ModalCardBody,
    ModalCardHeader,
    ModalCardTitle,
    Table,
    Section
} from 'bloomer'
import { CircleLoader } from 'react-spinners';

const socket = openSocket('http://localhost:8000');

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            rg_sess_id: null,
            logged_in: false,
            message: "I'm bored.",
            percent: 0,
            room_name: null,
            connection: 'Disconnected',
            rooms_mapped: false,
            accounts: [],
            current_tab: 1
        }
        this.login = this.login.bind(this)
        this.updateRgSessId = this.updateRgSessId.bind(this)
        this.checkAccounts = this.checkAccounts.bind(this)
        this.findPath = this.findPath.bind(this)
        this.setTab = this.setTab.bind(this)
    }

    componentDidMount() {
        socket.emit('checkLogin')
        socket.emit('mapRooms')

        socket.on('updateRgSessId', rg_sess_id => {
            this.setState({rg_sess_id, logged_in: true})
        })

        socket.on('checkLogin', data => {
            let { logged_in, rg_sess_id } = data
            this.setState({logged_in, rg_sess_id})

            if(logged_in) {
                this.setState({connection: 'Connected'})
            } else {
                this.setState({connection: 'Disconnected'})
            }
        })

        socket.on('pathStatus', data => {
            this.setState({message: data.message})
        })

        socket.on('updateProgress', data => {
            let { percent, room_name } = data
            this.setState({percent, room_name})
        })

        socket.on('roomsMapped', rooms_mapped => {
            this.setState({rooms_mapped})
        })

        socket.on('showAccounts', data => {
            this.setState({accounts: data.accounts})
        })
    }

    updateRgSessId(e) {
        this.setState({rg_sess_id: e.target.value})
    }

    login() {
        socket.emit('login', this.state.rg_sess_id)
    }

    checkAccounts() {
        socket.emit('getAccounts');
    }

    findPath() {
        socket.emit('findPath')
    }

    mapRooms() {
        socket.emit('mapRooms')
    }

    move() {
        socket.emit('move')
    }

    setTab(tab_id) {
        this.setState({current_tab: tab_id})
    }

    render() {
        return (
            <div>
                <Modal isActive={!this.state.rooms_mapped}>
                    <ModalBackground />
                    <ModalCard>
                        <ModalCardHeader>
                            <ModalCardTitle>Mapping Rooms</ModalCardTitle>
                        </ModalCardHeader>
                        <ModalCardBody>
                            <Columns isCentered>
                                <CircleLoader
                                    color={'#123abc'}
                                />
                            </Columns>
                            <Columns isCentered>
                                <span style={{marginTop: 10}}>This might take a minute...</span>
                            </Columns>
                        </ModalCardBody>
                    </ModalCard>
                </Modal>
                <Navbar style={{borderBottom: "1px solid #dfdfdf"}}>
                    <NavbarBrand>
                        <NavbarItem>mDCAAR - Outwar Auto Attacker &amp; Raider</NavbarItem>
                    </NavbarBrand>
                    <NavbarEnd>
                        <NavbarItem>Status:&nbsp;<span className={(this.state.connection === 'Disconnected') ? 'has-text-danger' : 'has-text-success'}>{this.state.connection}</span></NavbarItem>
                    </NavbarEnd>
                </Navbar>
                {(this.state.logged_in && this.state.rg_sess_id != null) &&
                <div>
                    <Columns isCentered style={{marginTop: 10}}>
                        <Column isSize={10}>
                            <Panel>
                                <PanelHeading>
                                    Accounts
                                    <Button style={{marginLeft: 10}} isColor='black' isSize='small' isOutlined onClick={this.checkAccounts}>Load Accounts</Button>
                                </PanelHeading>
                                <PanelBlock style={{overflow: 'auto'}}>
                                    <div style={{height: '300px', width: '100%'}}>
                                    <Table isStriped isBordered style={{width: '100%'}}>
                                        <thead>
                                            <tr>
                                                <th style={{width: 10}}><input type="checkbox" /></th>
                                                <th style={{width: 175}}>Character</th>
                                                <th style={{width: 75}}>Power</th>
                                                <th style={{width: 75}}>Rage</th>
                                                <th style={{width: 175}}>Crew</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.accounts.map((character) => {
                                                return (
                                                    <tr>
                                                        <td><input type="checkbox" name="character[]" value={character.id} /></td>
                                                        <td>
                                                            <a 
                                                                target="_new" 
                                                                href={`http://torax.outwar.com/world?suid=${character.id}&serverid=2&rg_sess_id=${this.state.rg_sess_id}`}
                                                            >
                                                                {character.name}
                                                            </a>
                                                        </td>
                                                        <td>{character.power}</td>
                                                        <td>{character.rage}</td>
                                                        <td>{character.crew}</td>
                                                        <td></td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </Table>
                                    </div>
                                </PanelBlock>
                            </Panel>
                        </Column>
                    </Columns>
                    <Columns isCentered style={{marginTop: 10}}>
                        <Column isSize={10}>
                            <Panel>
                                <PanelHeading style={{padding: 0}}>
                                <Tabs isAlign={'centered'} style={{width: '100%'}}>
                                    <TabList>
                                        <Tab>
                                            <TabLink onClick={() => this.setTab(1)}>
                                                <span>Mobs</span>
                                            </TabLink>
                                        </Tab>
                                        <Tab>
                                            <TabLink onClick={() => this.setTab(2)}>
                                                <span>Rooms</span>
                                            </TabLink>
                                        </Tab>
                                        <Tab>
                                            <TabLink onClick={() => this.setTab(3)}>
                                                <span>God Raider</span>
                                            </TabLink>
                                        </Tab>
                                        <Tab>
                                            <TabLink onClick={() => this.setTab(4)}>
                                                <span>Set Raider</span>
                                            </TabLink>
                                        </Tab>
                                        <Tab>
                                            <TabLink onClick={() => this.setTab(5)}>
                                                <span>Tools</span>
                                            </TabLink>
                                        </Tab>
                                        <Tab>
                                            <TabLink onClick={() => this.setTab(6)}>
                                                <span>Settings</span>
                                            </TabLink>
                                        </Tab>
                                    </TabList>
                                </Tabs>
                                </PanelHeading>
                                <PanelBlock>
                                    <Container>
                                        <Section isHidden={this.state.current_tab != 1}>
                                            <a target="_new" href={`http://torax.outwar.com/profile.php?rg_sess_id=${this.state.rg_sess_id}`}>Open Outwar in Tab</a><br/><br/>
                                            <Button isColor='primary' onClick={this.move}>Move Rooms</Button>
                                        </Section>
                                        <Section isHidden={this.state.current_tab != 2}>
                                            Rooms
                                        </Section>
                                        <Section isHidden={this.state.current_tab != 3}>
                                            God Raider
                                        </Section>
                                        <Section isHidden={this.state.current_tab != 4}>
                                            Set Raider
                                        </Section>
                                        <Section isHidden={this.state.current_tab != 5}>
                                            Tools
                                        </Section>
                                        <Section isHidden={this.state.current_tab != 6}>
                                            Settings
                                        </Section>
                                    </Container>
                                </PanelBlock>
                            </Panel>
                        </Column>
                    </Columns>
                </div>
                }
                {(!this.state.logged_in) &&
                    <Columns isCentered style={{marginTop: 10}}>
                        <Column isSize={3}>
                            <Panel>
                                <PanelHeading>Login</PanelHeading>
                                <PanelBlock>
                                    <Container>
                                        <Field>
                                            <Label>Username</Label>
                                            <Control>
                                                <Input type="text" placeholder='Username' />
                                            </Control>
                                        </Field>
                                        <Field>
                                            <Label>Password</Label>
                                            <Control>
                                                <Input type="password" placeholder='Username' />
                                            </Control>
                                        </Field>
                                        <Column style={{marginBottom: 10, textAlign: 'center', borderTop: "1px solid #dfdfdf", borderBottom: "1px solid #dfdfdf"}}>
                                            <span style={{fontWeight: 700, fontStyle: 'italic'}}>OR</span>
                                        </Column>
                                        <Field>
                                            <Label>RG Session ID</Label>
                                            <Control>
                                                <Input type="text" placeholder='rg_sess_id' onChange={this.updateRgSessId} />
                                            </Control>
                                        </Field>
                                        <Field>
                                            <Control>
                                                <Button  onClick={() => this.login()} isColor='primary'>Login</Button>
                                            </Control>
                                        </Field>
                                    </Container>
                                </PanelBlock>
                            </Panel>
                        </Column>
                    </Columns>
                }
                {/*(this.state.logged_in && this.state.rg_sess_id != null) &&
                    <Columns style={{position: 'fixed', bottom: 0, width: '100%', margin: 0}}>
                        <Column isSize={12} style={{paddingBottom: 0}}>
                            <Panel>
                                <PanelHeading>Auto Mover Progress | {this.state.room_name || 'none'}</PanelHeading>
                                <PanelBlock>
                                    <Progress isColor='primary' value={this.state.percent} max={100}/>
                                </PanelBlock>
                            </Panel>
                        </Column>
                    </Columns>
                */}
            </div>
        )
    }
}

export default App;